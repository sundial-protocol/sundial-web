// Solstice API types — shared between the sundial-web proxy routes
// (app/api/solstice/*) and the dashboard hook (hooks/dashboard/solstice.tsx).
//
// Contract source: prompts/solstice/Solstice API Spec.md (§3 shared types,
// §4–6 flow payloads). Conventions: snake_case fields; BTC amounts are integer
// satoshis (`_sats`); RT/Rune amounts are decimal strings of integer base
// units (`_rt`) since a fixed-supply Rune total can exceed
// Number.MAX_SAFE_INTEGER; timestamps are ISO-8601 UTC strings (`_at`).

// ---------------------------------------------------------------------------
// Error envelope (spec §1)
// ---------------------------------------------------------------------------

export type SolsticeErrorCode =
  | "QUOTE_EXPIRED" // 409 — validity window passed between build and submit
  | "RATIO_MOVED" // 409 — ratio drifted beyond tolerance vs the quote
  | "RESERVE_STALE" // 503 — PoR attestation stale → investment paused
  | "INSTANCE_PAUSED" // 503 — instance halted (invariant breach / ops)
  | "AMOUNT_BELOW_MIN"; // 400 — below min_invest_sats / min_redeem_rt

// Follows Nest's default error shape ({ statusCode, error, message }) plus a
// machine-readable `code` for the states the UI must branch on.
export interface SolsticeErrorResponse {
  statusCode: number;
  error: string;
  code: SolsticeErrorCode;
  message: string;
}

// ---------------------------------------------------------------------------
// Core shared types (spec §3)
// ---------------------------------------------------------------------------

export interface ReceiptRune {
  rune_id: string; // e.g. "840000:3" (block:tx), NOT a uuid
  ticker: string; // "CALADAN•RT", "QBTC"
  symbol: string | null; // unicode symbol if any
  divisibility: number; // Runes divisibility 0–38
}

// Claim Ratio = (BTC_yp + BTC_buffer) / (RT_total − RT_vault). Spec §2.1.
// Components exposed for transparency; transact against the signed /quote.
export interface ClaimRatio {
  btc_per_rt: string; // decimal string, BTC-per-RT (canonical, §2.1)
  rt_per_btc: string; // decimal string, convenience/inverse
  btc_yp_sats: number; // Layer-1 reserve read (identity or quantity×NAV)
  btc_buffer_sats: number;
  rt_total: string; // base units, fixed supply
  rt_vault: string; // base units still unissued in Vault
  rt_circulating: string; // rt_total − rt_vault
  as_of_at: string; // ISO timestamp
  // asset-backed only:
  nav_usd_per_unit?: string;
  nav_source?: string; // e.g. a fund/LST NAV feed
}

// O/C0.2 + §4.5. Layer 1 always present; Layer 2 only for Vault-track instances.
export interface ReserveStatus {
  layer1: { btc_yp_sats: number; as_of_at: string; stale: boolean };
  layer2: {
    enabled: boolean; // Vault track only
    attested_backing_sats: number | null;
    attestation_at: string | null;
    stale: boolean; // stale beyond threshold → investment gated
    threshold_ms: number;
  };
  investment_paused: boolean; // true when reserve checks fail (spec O/C0.2)
  paused_reason: string | null;
}

// A Solstice vault instance. Each YP = its own vault + own receipt Rune +
// own profile. In the dashboard each instance is a SEPARATE yield-option card.
export interface SolsticeInstance {
  instance_id: string; // uuid
  slug: string; // "caladan" | "qbtc" | …
  name: string; // "Caladan", "qBTC"
  yp_type: "btc_returning" | "asset_backed";
  network: "bitcoin" | "testnet";
  receipt_rune: ReceiptRune;
  claim_ratio: ClaimRatio; // latest published snapshot; use /quote to transact
  reserve_status: ReserveStatus;
  redemption: {
    instant_available: boolean; // buffer headroom + within per-cycle cap now
    cycle_ms: number; // YP redemption cycle length
    next_settlement_at: string | null; // cycle end for queued redemptions
  };
  min_invest_sats: number;
  min_redeem_rt: string; // base units
  is_active: boolean;
}

// Signed quote binding pricing to a short validity window (spec §7.1).
export interface RatioQuote {
  quote_id: string; // uuid; passed into build
  instance_id: string;
  claim_ratio: ClaimRatio;
  issued_at: string;
  expires_at: string; // short window (seconds)
  validity_ms: number;
  signature: string; // server signature over the quote payload
}

// Priced preview attached to a quote when `amount_sats` is supplied (§4.1).
export interface QuotePreview {
  amount_sats: number;
  rt_out: string;
  fee_sats: number;
  effective_btc_per_rt: string;
}

export interface RatioQuoteResponse extends RatioQuote {
  preview?: QuotePreview;
}

// ---------------------------------------------------------------------------
// Investment flow (spec §4)
// ---------------------------------------------------------------------------

export interface InvestBuildRequest {
  quote_id: string;
  user_beneficiary_address: string; // receives change / holds RT
  user_pubkey_hex: string; // 66-char compressed
  amount_sats: number;
  network: "bitcoin" | "testnet";
}

export interface InvestBuildResponse {
  swap_id: string;
  instance_id: string;
  quote_id: string;
  expires_at: string; // client must submit before this
  amount_sats: number;
  rt_out: string;
  fee_sats: number;
  psbt_base64: string; // Vault RT → user; user BTC → Vault/buffer
  network: "bitcoin" | "testnet";
}

export interface InvestSubmitRequest {
  swap_id: string;
  signed_psbt_base64: string;
}

export interface InvestSubmitResponse {
  swap_id: string;
  status: "submitted";
  txid: string;
  rt_out: string;
  submitted_at: string;
}

// ---------------------------------------------------------------------------
// Redemption flow (spec §5)
// ---------------------------------------------------------------------------

export interface RedeemBuildRequest {
  quote_id: string;
  user_address: string; // receives BTC; also the RT source
  user_pubkey_hex: string;
  amount_rt: string;
  network: "bitcoin" | "testnet";
}

// build decides instant vs queued by confirming buffer headroom at
// construction time (spec §4.3 / §C2). The instant one-tx promise is never
// made when it can't be honored.
export interface RedeemInstantResponse {
  mode: "instant";
  swap_id: string;
  quote_id: string;
  expires_at: string;
  amount_rt: string;
  payout_sats: number;
  fee_sats: number;
  psbt_base64: string; // Buffer BTC → user; user RT → Vault
  network: "bitcoin" | "testnet";
}

export interface RedeemQueuedResponse {
  mode: "queued";
  request_id: string;
  quote_id: string; // locks claim at request-time ratio
  expires_at: string;
  amount_rt: string;
  locked_payout_sats: number;
  queue_position: number;
  estimated_settlement_at: string; // cycle end
  psbt_base64: string; // user RT → Vault/redemption-pending (lock-in)
  network: "bitcoin" | "testnet";
}

export type RedeemBuildResponse = RedeemInstantResponse | RedeemQueuedResponse;

export interface RedeemSubmitRequest {
  swap_id?: string; // instant path
  request_id?: string; // queued path
  signed_psbt_base64: string;
}

export type RedeemSubmitResponse =
  | { status: "submitted"; txid: string; payout_sats: number }
  | {
      status: "queued";
      request_id: string;
      queue_position: number;
      reservation_expected_at: string;
    };

// ---------------------------------------------------------------------------
// Queued settlement — Claim Reservation (spec §5.3)
// ---------------------------------------------------------------------------

export interface Reservation {
  reservation_id: string;
  request_id: string;
  address: string;
  amount_rt: string;
  payout_sats: number; // locked at request-time ratio
  status:
    | "pending"
    | "claimable"
    | "claimed"
    | "expired_reclaimable"
    | "reclaimed";
  claimable_at: string;
  reclaim_after_at: string; // YP-path timelock
  outpoint: string | null; // "txid:vout" once minted
}

export interface ReservationClaimBuildRequest {
  reservation_id: string;
  user_address: string;
  user_pubkey_hex: string;
  network: "bitcoin" | "testnet";
}

export interface ReservationClaimBuildResponse {
  reservation_id: string;
  swap_id: string;
  expires_at: string;
  payout_sats: number;
  psbt_base64: string; // consumes Reservation, returns correct RT to Vault
  network: "bitcoin" | "testnet";
}

// ---------------------------------------------------------------------------
// Positions & reserves (spec §6)
// ---------------------------------------------------------------------------

export interface PendingRedemption {
  request_id: string;
  amount_rt: string;
  locked_payout_sats: number;
  queue_position: number;
  status: "queued";
  estimated_settlement_at: string;
}

export interface PositionResponse {
  instance_id: string;
  address: string;
  rt_balance: string;
  value_sats: number; // rt_balance × current claim ratio
  claim_ratio: { btc_per_rt: string; as_of_at: string };
  pending_redemptions: PendingRedemption[];
}
