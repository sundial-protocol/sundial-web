"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  BeamReceiveInput,
  TransferErrorCode,
  TransferErrorResponse,
  TransferInitiateRequest,
  TransferInitiateResponse,
  TransferInitiateSuccessResponse,
  TransferModeResponse,
  TransferServiceMode,
  TransferStatusResponse,
  TransferStatusSuccessResponse,
  TransferSubmitSignedSourceResponse,
} from "@/app/api/transfer/types";
import { isPollableTransferStep } from "@/lib/transfer/steps";

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

// Backoff for a status read that failed, and a point at which to stop.
//
// A transfer can legitimately take an hour, so one blip must not end the flow.
// But retrying at a flat 3s forever is worse: a status read that can never
// succeed — a stale id from a restarted server, a route returning an HTML error
// page so `res.json()` throws — polls the service every three seconds
// indefinitely, from behind a compose form that gives no hint anything is
// running. Back off, then give up and say so.
const RETRY_BACKOFF_MS = [3_000, 6_000, 12_000, 24_000, 30_000];
const MAX_CONSECUTIVE_FAILURES = 8;

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
  // Which implementation is answering, known before any transfer exists so the
  // UI can say so while a transfer is still being composed. Null until the
  // lookup resolves, or if it fails — callers render nothing rather than
  // guessing, since a wrong badge is worse than no badge.
  serviceMode: TransferServiceMode | null;
  transferId: string | null;
  status: TransferStatusSuccessResponse | null;
  // A transfer is stored but its status cannot be read. Distinct from "no
  // transfer": rendering the compose form here would hide the fact that a
  // retry loop is running against an id the user cannot see.
  isUnreadable: boolean;
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
  // For a Charms beam-receive in live mode: build and prove the transaction
  // for real from these inputs instead of supplying one already proven. See
  // lib/transfer/charms-beam-receive.ts.
  submitBeamReceive: (input: BeamReceiveInput) => Promise<boolean>;
  reset: () => void;
  refresh: () => void;
}

export function useTransfer(): UseTransferResult {
  const [serviceMode, setServiceMode] = useState<TransferServiceMode | null>(
    null,
  );
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

  // Asked once per mount. Cheap, and it cannot drift from what the routes
  // actually dispatch on because it is served by the same functions.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/transfer/mode", { cache: "no-store" })
      .then((res) => res.json() as Promise<TransferModeResponse>)
      .then((data) => {
        if (!cancelled) setServiceMode(data.mode);
      })
      .catch((e) => {
        // Leave it null. The badge disappears, which is the right failure —
        // better silent than confidently wrong about whether funds are real.
        console.warn("Could not read the transfer service mode:", e);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    // Per effect run, not state: a re-run means a different transfer or an
    // explicit refresh, both of which deserve a clean slate.
    let consecutiveFailures = 0;

    const scheduleRetry = () => {
      consecutiveFailures += 1;
      if (consecutiveFailures > MAX_CONSECUTIVE_FAILURES) {
        applyError(
          "Stopped checking this transfer after repeated failures. Reload the page to try again.",
          "SERVICE_UNAVAILABLE",
        );
        return;
      }
      timer = setTimeout(
        poll,
        RETRY_BACKOFF_MS[
          Math.min(consecutiveFailures - 1, RETRY_BACKOFF_MS.length - 1)
        ],
      );
    };

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

          // A transfer the service no longer knows about is not coming back, so
          // this is terminal: drop the stored id and stop. Every other error is
          // treated as transient and retried, because abandoning a real
          // in-flight transfer over one 500 would lose the user's only handle
          // on it.
          if (data.code === "TRANSFER_UNKNOWN") {
            persistId(null);
            setTransferId(null);
            return;
          }

          scheduleRetry();
          return;
        }

        clearError();
        setStatus(data);
        consecutiveFailures = 0;

        // Only steps the *service* can advance are worth asking about again.
        // `awaiting_signature` waits on the user, and the only thing that moves
        // it is this client calling submitSigned — which refreshes itself. Left
        // as "non-terminal means keep polling", it asked the server the same
        // question every three seconds for as long as the signing panel stayed
        // open.
        //
        // The cost is that a second tab signing the same transfer will not
        // notice until it remounts. That is a fair trade: resuming after a
        // refresh or on another device reads status on mount and works, and
        // that is the requirement — live cross-tab sync never was.
        if (isPollableTransferStep(data.step)) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (e) {
        if (cancelled) return;
        console.error("Failed to read transfer status:", e);
        applyError(
          "Could not reach the transfer service.",
          "SERVICE_UNAVAILABLE",
        );
        scheduleRetry();
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

  // Shared body for both ways to authorize a submission — a signed
  // transaction, or the real inputs to build and prove a beam-receive — since
  // everything past assembling the request body is identical: post, check for
  // an error envelope, refresh on success.
  const postSubmission = useCallback(
    async (payload: {
      signedSourceTx?: string;
      beamReceiveInput?: BeamReceiveInput;
    }) => {
      if (!transferId) return false;

      setIsSubmitting(true);
      clearError();

      try {
        const res = await fetch("/api/transfer/submit-signed-source", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transferId, ...payload }),
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
        console.error("Failed to submit the transaction:", e);
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

  const submitSigned = useCallback(
    (signedSourceTx: string) => postSubmission({ signedSourceTx }),
    [postSubmission],
  );

  const submitBeamReceive = useCallback(
    (input: BeamReceiveInput) => postSubmission({ beamReceiveInput: input }),
    [postSubmission],
  );

  const reset = useCallback(() => {
    persistId(null);
    setTransferId(null);
    setStatus(null);
    clearError();
  }, [persistId]);

  return {
    serviceMode,
    transferId,
    status,
    isUnreadable: !!transferId && !status && !!error,
    // Restoring covers both halves of the resume: reading the stored id, and
    // the first status read for it. Rendering the compose form during either
    // would flash a fresh form over a transfer that is actually mid-flight.
    isRestoring: !hasRestored || (!!transferId && !status && !error),
    isSubmitting,
    error,
    errorCode,
    initiate,
    submitSigned,
    submitBeamReceive,
    reset,
    refresh,
  };
}

export default useTransfer;
