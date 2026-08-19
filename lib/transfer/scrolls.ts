import "server-only";

import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";

// Client for the `scrolls_cardano` canister on IC mainnet.
//
// Scrolls re-verifies a charms spell proof **from the transaction alone** — no
// chain access, no UTxO lookups — and threshold-signs it. That signature is
// what authorizes the mint on the Sundial L2, in place of an on-chain Groth16
// verifier. It is the load-bearing trust assumption of the whole peg-in, which
// is why this runs server-side only.
//
// Candid interface and the fee-output requirement are from
// charms-test/docs/beam-to-l2-frontend-spec.md §6.1–6.2; the reference call is
// charms-test/scripts/scrolls-call/call.mjs.

const CANISTER_ID = "tty7k-waaaa-aaaak-qvngq-cai";
const IC_HOST = "https://ic0.app";

const idlFactory: IDL.InterfaceFactory = ({ IDL: idl }) => {
  const Result = idl.Variant({ Ok: idl.Text, Err: idl.Text });
  return idl.Service({
    // Verifies the spell and threshold-signs; returns the witnessed tx hex.
    sign: idl.Func([idl.Text], [Result], []),
    // Cardano **mainnet** Mithril finality signature. Not usable for L2 or
    // preprod finality — peg-in uses `sign`, not this.
    certify_final: idl.Func([idl.Text], [Result], []),
    config: idl.Func(
      [],
      [
        idl.Record({
          fee_address: idl.Vec(idl.Tuple(idl.Text, idl.Text)),
          fixed_cost: idl.Nat64,
        }),
      ],
      ["query"],
    ),
    finality_vkey: idl.Func([], [Result], []),
    vkey: idl.Func([], [Result], []),
  });
};

type ScrollsResult = { Ok: string } | { Err: string };

interface ScrollsActor {
  sign: (txHex: string) => Promise<ScrollsResult>;
  certify_final: (txHex: string) => Promise<ScrollsResult>;
  config: () => Promise<{
    fee_address: Array<[string, string]>;
    fixed_cost: bigint;
  }>;
}

// The canister could not be reached, or answered unusably. An outage.
export class ScrollsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScrollsError";
  }
}

// The canister was reached and said no.
//
// Kept distinct from ScrollsError because the two need opposite handling: an
// outage is retryable and nothing the caller did, whereas a refusal means the
// transaction itself is wrong — malformed CBOR, a missing fee output, a spell
// that does not verify — and is fixed by changing the transaction, not by
// waiting. Collapsing them shows "service unavailable" for what is really
// "your transaction is invalid", which sends the user looking in the wrong
// place.
export class ScrollsRefusedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScrollsRefusedError";
  }
}

// Anonymous: `sign` and `config` take no caller identity, matching the
// reference implementation. Cached because agent construction fetches the root
// key material and there is no per-request state to keep separate.
let cached: ScrollsActor | null = null;

const actor = async (): Promise<ScrollsActor> => {
  if (cached) return cached;
  const agent = await HttpAgent.create({ host: IC_HOST });
  cached = Actor.createActor<ScrollsActor>(idlFactory, {
    agent,
    canisterId: CANISTER_ID,
  });
  return cached;
};

const unwrap = (result: ScrollsResult, action: string): string => {
  if ("Ok" in result) return result.Ok;
  throw new ScrollsRefusedError(`Scrolls refused to ${action}: ${result.Err}`);
};

/**
 * Threshold-signs a charm transaction, returning the witnessed hex.
 *
 * The transaction must already carry a fee output to
 * `config().fee_address[network]` at index `spell.tx.outs.len()`, or the
 * canister refuses it (§6.2). That output is the caller's responsibility —
 * the transaction is built before it reaches here.
 */
export const sign = async (txHex: string): Promise<string> => {
  const trimmed = txHex.trim();
  if (!trimmed) throw new ScrollsError("Nothing to sign.");

  let result: ScrollsResult;
  try {
    result = await (await actor()).sign(trimmed);
  } catch (e) {
    console.error("Scrolls sign call failed:", e);
    throw new ScrollsError("The Scrolls canister is unreachable.");
  }
  return unwrap(result, "sign this transaction");
};

export interface ScrollsConfig {
  // Fee address per network, e.g. { mainnet: "addr1…", preprod: "addr_test1…" }.
  feeAddresses: Record<string, string>;
  fixedCost: number;
}

/**
 * Reads the canister's live fee configuration.
 *
 * Read rather than hardcoded because the canister can change it, and a stale
 * constant would produce transactions Scrolls then refuses to sign.
 */
export const config = async (): Promise<ScrollsConfig> => {
  let raw: Awaited<ReturnType<ScrollsActor["config"]>>;
  try {
    raw = await (await actor()).config();
  } catch (e) {
    console.error("Scrolls config call failed:", e);
    throw new ScrollsError("The Scrolls canister is unreachable.");
  }

  return {
    feeAddresses: Object.fromEntries(raw.fee_address),
    // Safe to narrow: a fixed cost in L2 base units is nowhere near 2^53.
    fixedCost: Number(raw.fixed_cost),
  };
};
