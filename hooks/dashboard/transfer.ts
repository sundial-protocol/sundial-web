"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  TransferErrorCode,
  TransferErrorResponse,
  TransferInitiateRequest,
  TransferInitiateResponse,
  TransferInitiateSuccessResponse,
  TransferStatusResponse,
  TransferStatusSuccessResponse,
  TransferSubmitSignedSourceResponse,
} from "@/app/api/transfer/types";
import { isTerminalTransferStep } from "@/lib/transfer/steps";

/**
 * Drives one transfer.
 *
 * The browser's whole share of the state is a `transferId` in localStorage.
 * Everything else — step, confirmations, the unsigned transaction — is re-read
 * from `/api/transfer/status/:id` on every mount. That is deliberate: a charms
 * beam is dominated by a Bitcoin finality wait of roughly an hour, so it has to
 * survive a refresh or a closed tab, and any state cached client-side is state
 * that can silently disagree with the service.
 *
 * Polling runs only while the step is non-terminal, and stops on its own once
 * the transfer settles or fails.
 */

const TRANSFER_STORAGE_KEY = "sundial:transfer";

// Fast enough that the confirmation counter feels live, slow enough not to
// hammer the service across an hour-long wait.
const POLL_INTERVAL_MS = 3_000;

// Every transfer route answers with either its success shape or `{error, code}`.
//
// The discriminant is a *string* `error` plus a `code`, not the mere presence of
// an `error` key. Presence alone is too weak: a success body that carries an
// `error: null` field satisfies it, and then every good response is read as a
// failure — silently, since the resulting message is null. Generic over the
// success type so one guard narrows all three responses.
function isError<T extends object>(
  payload: T | TransferErrorResponse,
): payload is TransferErrorResponse {
  const candidate = payload as Partial<TransferErrorResponse>;
  return typeof candidate.error === "string" && candidate.code !== undefined;
}

export interface UseTransferResult {
  transferId: string | null;
  status: TransferStatusSuccessResponse | null;
  // True until the first status read resolves, so the UI can avoid flashing the
  // compose form over a transfer that is actually still running.
  isRestoring: boolean;
  isSubmitting: boolean;
  error: string | null;
  errorCode: TransferErrorCode | null;
  initiate: (
    input: TransferInitiateRequest,
  ) => Promise<TransferInitiateSuccessResponse | null>;
  submitSigned: (signedSourceTx: string) => Promise<boolean>;
  reset: () => void;
  refresh: () => void;
}

export function useTransfer(): UseTransferResult {
  const [transferId, setTransferId] = useState<string | null>(null);
  const [status, setStatus] = useState<TransferStatusSuccessResponse | null>(
    null,
  );
  // localStorage cannot be read during render without breaking SSR, so the
  // stored id arrives one effect late. Polling has to wait for it, or the first
  // pass sees a null id and settles on "no transfer" before the real one lands.
  const [hasRestored, setHasRestored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<TransferErrorCode | null>(null);

  // Bumping this re-runs the polling effect, which is how `refresh()` avoids
  // duplicating the fetch or racing the effect's own cancellation guard.
  const [reloadToken, setReloadToken] = useState(0);
  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  // Read the stored id once, on mount. Written back by initiate/reset.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(TRANSFER_STORAGE_KEY);
    } catch {
      // Private browsing or a blocked store. The flow still works for the life
      // of the tab; it just cannot be resumed after a reload.
    }
    setTransferId(stored && stored.length > 0 ? stored : null);
    setHasRestored(true);
  }, []);

  const persistId = useCallback((id: string | null) => {
    try {
      if (id) window.localStorage.setItem(TRANSFER_STORAGE_KEY, id);
      else window.localStorage.removeItem(TRANSFER_STORAGE_KEY);
    } catch {
      // Non-fatal; see above.
    }
  }, []);

  const clearError = () => {
    setError(null);
    setErrorCode(null);
  };

  const applyError = (message: string, code: TransferErrorCode) => {
    setError(message);
    setErrorCode(code);
  };

  useEffect(() => {
    if (!hasRestored) return;
    if (!transferId) {
      setStatus(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/transfer/status/${encodeURIComponent(transferId)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as TransferStatusResponse;
        if (cancelled) return;

        if (isError(data)) {
          applyError(data.error, data.code);
          setStatus(null);
          // A transfer the service no longer knows about is not coming back.
          // Drop the stored id so the next mount offers a fresh start instead
          // of re-reporting the same dead transfer.
          if (data.code === "TRANSFER_UNKNOWN") {
            persistId(null);
            setTransferId(null);
          }
          return;
        }

        clearError();
        setStatus(data);

        if (!isTerminalTransferStep(data.step)) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (e) {
        if (cancelled) return;
        console.error("Failed to read transfer status:", e);
        applyError(
          "Could not reach the transfer service.",
          "SERVICE_UNAVAILABLE",
        );
        // Keep trying — a transient network blip during an hour-long wait
        // should not end the flow.
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [hasRestored, transferId, reloadToken, persistId]);

  const initiate = useCallback(
    async (input: TransferInitiateRequest) => {
      setIsSubmitting(true);
      clearError();

      try {
        const res = await fetch("/api/transfer/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = (await res.json()) as TransferInitiateResponse;

        if (isError(data)) {
          applyError(data.error, data.code);
          return null;
        }

        persistId(data.transferId);
        setTransferId(data.transferId);
        return data;
      } catch (e) {
        console.error("Failed to initiate transfer:", e);
        applyError(
          "Could not reach the transfer service.",
          "SERVICE_UNAVAILABLE",
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistId],
  );

  const submitSigned = useCallback(
    async (signedSourceTx: string) => {
      if (!transferId) return false;

      setIsSubmitting(true);
      clearError();

      try {
        const res = await fetch("/api/transfer/submit-signed-source", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transferId, signedSourceTx }),
        });
        const data = (await res.json()) as TransferSubmitSignedSourceResponse;

        if (isError(data)) {
          applyError(data.error, data.code);
          return false;
        }

        // Pull the new step straight away rather than waiting out a poll tick —
        // the user just acted and the progress view should move with them.
        refresh();
        return true;
      } catch (e) {
        console.error("Failed to submit the signed source transaction:", e);
        applyError(
          "Could not reach the transfer service.",
          "SERVICE_UNAVAILABLE",
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [transferId, refresh],
  );

  const reset = useCallback(() => {
    persistId(null);
    setTransferId(null);
    setStatus(null);
    clearError();
  }, [persistId]);

  return {
    transferId,
    status,
    // Restoring covers both halves of the resume: reading the stored id, and
    // the first status read for it. Rendering the compose form during either
    // would flash a fresh form over a transfer that is actually mid-flight.
    isRestoring: !hasRestored || (!!transferId && !status && !error),
    isSubmitting,
    error,
    errorCode,
    initiate,
    submitSigned,
    reset,
    refresh,
  };
}

export default useTransfer;
