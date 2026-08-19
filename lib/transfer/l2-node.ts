import "server-only";

// Client for the Sundial L2 node.
//
// Server-side only, and enforced: `server-only` makes an accidental client
// import a build error rather than a runtime leak of the node URL. Everything
// the browser sees goes through app/api/transfer/*.
//
// Endpoint shapes and their gotchas are from
// charms-test/docs/beam-to-l2-frontend-spec.md §6.3, all learned empirically
// against the live node.

const nodeBaseUrl = (): string | null => {
  const raw = process.env.SUNDIAL_L2_NODE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
};

export class L2NodeError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "L2NodeError";
    this.status = status;
  }
}

const requireBaseUrl = (): string => {
  const base = nodeBaseUrl();
  if (!base) {
    throw new L2NodeError(
      "SUNDIAL_L2_NODE_URL is not set on this deployment.",
    );
  }
  return base;
};

const isHex = (value: string): boolean =>
  value.length > 0 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value);

export interface L2SubmitResult {
  // The node's queue id for the accepted transaction.
  queueId: string | null;
  message: string;
}

/**
 * Submits a signed transaction to the L2.
 *
 * The hex goes in the **request body**. The `?tx_cbor=` query form that the
 * node's own API table implies is wrong — the handler reads `request.text()`
 * and validates `isHexString`, so the query form comes back as
 * `400 Invalid CBOR provided`. That is verified against the live node.
 *
 * Success means *enqueued*, not *applied*. Block production is a separate,
 * operator-gated step, so callers must confirm arrival by reading the
 * destination address rather than trusting this response.
 */
export const submitTransaction = async (
  txHex: string,
): Promise<L2SubmitResult> => {
  const base = requireBaseUrl();
  const hex = txHex.trim();

  // Checked here as well as at the API edge: this is the last point before a
  // transaction reaches a ledger, and the node's own error for a malformed body
  // is indistinguishable from one for a well-formed but invalid transaction.
  if (!isHex(hex)) {
    throw new L2NodeError("The transaction must be raw hex.");
  }

  let response: Response;
  try {
    response = await fetch(`${base}/submit`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: hex,
      cache: "no-store",
    });
  } catch (e) {
    console.error("L2 submit request failed:", e);
    throw new L2NodeError("The L2 node is unreachable.");
  }

  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    // Non-JSON response — keep the raw text for the error below.
  }

  if (!response.ok) {
    throw new L2NodeError(
      typeof body.error === "string"
        ? body.error
        : text.slice(0, 200) || `The L2 node returned ${response.status}.`,
      response.status,
    );
  }

  return {
    queueId: typeof body.id === "string" ? body.id : null,
    message:
      typeof body.message === "string" ? body.message : "Submitted to the L2.",
  };
};

/**
 * Fetches a transaction's CBOR by hash — mempool first, then immutable.
 *
 * This is how a prev-tx is obtained for proving: the beam-receive needs the
 * transaction that created the placeholder it consumes.
 */
export const getTransaction = async (txHash: string): Promise<string> => {
  const base = requireBaseUrl();

  if (!/^[0-9a-fA-F]{64}$/.test(txHash)) {
    throw new L2NodeError("A transaction hash must be 64 hex characters.");
  }

  let response: Response;
  try {
    response = await fetch(
      `${base}/tx?tx_hash=${encodeURIComponent(txHash)}`,
      { cache: "no-store" },
    );
  } catch (e) {
    console.error("L2 tx request failed:", e);
    throw new L2NodeError("The L2 node is unreachable.");
  }

  const body = (await response.json().catch(() => ({}))) as {
    tx?: unknown;
    error?: unknown;
  };

  if (!response.ok || typeof body.tx !== "string") {
    throw new L2NodeError(
      typeof body.error === "string"
        ? body.error
        : "The L2 node did not return that transaction.",
      response.status,
    );
  }

  return body.tx;
};

export interface L2Health {
  live: boolean;
  ready: boolean;
}

// Both probes, so a node that is up but not accepting work is distinguishable
// from one that is down. Never throws — an unreachable node is a health answer,
// not an exception.
export const health = async (): Promise<L2Health> => {
  const base = nodeBaseUrl();
  if (!base) return { live: false, ready: false };

  const probe = async (path: string): Promise<boolean> => {
    try {
      const res = await fetch(`${base}${path}`, { cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  };

  const [live, ready] = await Promise.all([
    probe("/health/live"),
    probe("/health/ready"),
  ]);
  return { live, ready };
};

/**
 * How many UTxOs an address currently holds.
 *
 * Used as the arrival signal: `/submit` returning 200 means *enqueued*, and
 * block production is a separate operator-gated step, so the only honest way to
 * say a transfer landed is to see it at the destination. Comparing a count
 * against a snapshot taken at submit time is crude but true — and while block
 * production is down it correctly never fires.
 */
export const getUtxoCount = async (address: string): Promise<number> => {
  const base = requireBaseUrl();

  let response: Response;
  try {
    response = await fetch(
      `${base}/utxos?address=${encodeURIComponent(address)}`,
      { cache: "no-store" },
    );
  } catch (e) {
    console.error("L2 utxos request failed:", e);
    throw new L2NodeError("The L2 node is unreachable.");
  }

  const body = (await response.json().catch(() => ({}))) as {
    utxos?: unknown;
    error?: unknown;
  };

  if (!response.ok || !Array.isArray(body.utxos)) {
    throw new L2NodeError(
      typeof body.error === "string"
        ? body.error
        : "The L2 node did not return UTxOs for that address.",
      response.status,
    );
  }

  return body.utxos.length;
};
