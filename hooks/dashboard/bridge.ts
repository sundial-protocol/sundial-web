"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  BridgeErrorCode,
  BridgeErrorResponse,
  BridgeInitiateResponse,
  BridgeInitiateSuccessResponse,
  BridgeStatusResponse,
  BridgeStatusSuccessResponse,
  BridgeSubmitSignedSourceResponse,
} from "@/app/api/bridge/types";
import { isTerminalBridgeStep } from "@/lib/bridge/steps";

/**
 * Drives one peg-in bridge request.
 *
 * The browser's whole share of the state is a `bridgeRequestId` in
 * localStorage. Everything else — step, confirmations, the unsigned PSBT — is
 * re-read from `/api/bridge/status/:id` on every mount. That is deliberate: the
 * flow is dominated by a Bitcoin finality wait of roughly an hour, so it has to
 * survive a refresh or a closed tab, and any state cached client-side is state
 * that can silently disagree with the service.
 *
 * Polling runs only while the step is non-terminal, and stops on its own once
 * the bridge lands or fails.
 */

const BRIDGE_REQUEST_STORAGE_KEY = "sundial:bridge-request";

// Fast enough that the confirmation counter feels live, slow enough not to
// hammer the service across an hour-long wait.
const POLL_INTERVAL_MS = 3_000;

// Every bridge route answers with either its success shape or `{error, code}`.
//
// The discriminant is a *string* `error` plus a `code`, not the mere presence of
// an `error` key. Presence alone is too weak: a success body that carries an
// `error: null` field satisfies it, and then every good response is read as a
// failure — silently, since the resulting message is null. Generic over the
// success type so one guard narrows all three responses.
function isError<T extends object>(
  payload: T | BridgeErrorResponse,
): payload is BridgeErrorResponse {
  const candidate = payload as Partial<BridgeErrorResponse>;
  return typeof candidate.error === "string" && candidate.code !== undefined;
}

export interface UseBridgeRequestResult {
  bridgeRequestId: string | null;
  status: BridgeStatusSuccessResponse | null;
  // True until the first status read resolves, so the UI can avoid flashing the
  // initiate form over a request that is actually still running.
  isRestoring: boolean;
  isSubmitting: boolean;
  error: string | null;
  errorCode: BridgeErrorCode | null;
  initiate: (input: {
    amount: number;
    l2DestAddr: string;
  }) => Promise<BridgeInitiateSuccessResponse | null>;
  submitSigned: (signedSourceTx: string) => Promise<boolean>;
  reset: () => void;
  refresh: () => void;
}

export function useBridgeRequest(): UseBridgeRequestResult {
  const [bridgeRequestId, setBridgeRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<BridgeStatusSuccessResponse | null>(null);
  // localStorage cannot be read during render without breaking SSR, so the
  // stored id arrives one effect late. Polling has to wait for it, or the first
  // pass sees a null id and settles on "no request" before the real one lands.
  const [hasRestored, setHasRestored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<BridgeErrorCode | null>(null);

  // Bumping this re-runs the polling effect, which is how `refresh()` avoids
  // duplicating the fetch or racing the effect's own cancellation guard.
  const [reloadToken, setReloadToken] = useState(0);
  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  // Read the stored id once, on mount. Written back by initiate/reset.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(BRIDGE_REQUEST_STORAGE_KEY);
    } catch {
      // Private browsing or a blocked store. The flow still works for the life
      // of the tab; it just cannot be resumed after a reload.
    }
    setBridgeRequestId(stored && stored.length > 0 ? stored : null);
    setHasRestored(true);
  }, []);

  const persistId = useCallback((id: string | null) => {
    try {
      if (id) window.localStorage.setItem(BRIDGE_REQUEST_STORAGE_KEY, id);
      else window.localStorage.removeItem(BRIDGE_REQUEST_STORAGE_KEY);
    } catch {
      // Non-fatal; see above.
    }
  }, []);

  const clearError = () => {
    setError(null);
    setErrorCode(null);
  };

  const applyError = (message: string, code: BridgeErrorCode) => {
    setError(message);
    setErrorCode(code);
  };

  useEffect(() => {
    if (!hasRestored) return;
    if (!bridgeRequestId) {
      setStatus(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/bridge/status/${encodeURIComponent(bridgeRequestId)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as BridgeStatusResponse;
        if (cancelled) return;

        if (isError(data)) {
          applyError(data.error, data.code);
          setStatus(null);
          // A request the service no longer knows about is not coming back.
          // Drop the stored id so the next mount offers a fresh start instead
          // of re-reporting the same dead request.
          if (data.code === "REQUEST_UNKNOWN") {
            persistId(null);
            setBridgeRequestId(null);
          }
          return;
        }

        clearError();
        setStatus(data);

        if (!isTerminalBridgeStep(data.step)) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (e) {
        if (cancelled) return;
        console.error("Failed to read bridge status:", e);
        applyError(
          "Could not reach the bridging service.",
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
  }, [hasRestored, bridgeRequestId, reloadToken, persistId]);

  const initiate = useCallback(
    async ({ amount, l2DestAddr }: { amount: number; l2DestAddr: string }) => {
      setIsSubmitting(true);
      clearError();

      try {
        const res = await fetch("/api/bridge/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asset: "BTC", amount, l2DestAddr }),
        });
        const data = (await res.json()) as BridgeInitiateResponse;

        if (isError(data)) {
          applyError(data.error, data.code);
          return null;
        }

        persistId(data.bridgeRequestId);
        setBridgeRequestId(data.bridgeRequestId);
        return data;
      } catch (e) {
        console.error("Failed to initiate bridge:", e);
        applyError(
          "Could not reach the bridging service.",
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
      if (!bridgeRequestId) return false;

      setIsSubmitting(true);
      clearError();

      try {
        const res = await fetch("/api/bridge/submit-signed-source", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bridgeRequestId, signedSourceTx }),
        });
        const data = (await res.json()) as BridgeSubmitSignedSourceResponse;

        if (isError(data)) {
          applyError(data.error, data.code);
          return false;
        }

        // Pull the new step straight away rather than waiting out a poll tick —
        // the user just acted and the stepper should move with them.
        refresh();
        return true;
      } catch (e) {
        console.error("Failed to submit the signed source transaction:", e);
        applyError(
          "Could not reach the bridging service.",
          "SERVICE_UNAVAILABLE",
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [bridgeRequestId, refresh],
  );

  const reset = useCallback(() => {
    persistId(null);
    setBridgeRequestId(null);
    setStatus(null);
    clearError();
  }, [persistId]);

  return {
    bridgeRequestId,
    status,
    // Restoring covers both halves of the resume: reading the stored id, and
    // the first status read for it. Rendering the initiate form during either
    // would flash a fresh form over a bridge that is actually mid-flight.
    isRestoring: !hasRestored || (!!bridgeRequestId && !status && !error),
    isSubmitting,
    error,
    errorCode,
    initiate,
    submitSigned,
    reset,
    refresh,
  };
}

export default useBridgeRequest;
