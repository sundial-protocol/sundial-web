// Mock fixtures for the Solstice API (mock phase, spec §7).
//
// Two instances, shaped exactly as the real btc-yield responses:
//   - caladan: btc_returning  (Layer-2 Vault track, PoR attested)
//   - qbtc:    asset_backed   (NAV-priced, Layer-1 only)
//
// Flip to the real backend by setting BTC_YIELD_API_URL and forwarding instead
// of returning these — the response shapes do not change.

import type {
  ClaimRatio,
  Reservation,
  SolsticeInstance,
} from "./types";

// A deterministic-ish base64 blob that stands in for a real PSBT in the mock
// phase. The client never broadcasts a Solstice swap PSBT (server-submit,
// spec §7.1), so a placeholder is safe here.
export const MOCK_PSBT_BASE64 =
  "cHNidP8BAHECAAAAAeXeZmVzdC1zb2xzdGljZS1tb2NrLXBzYnQtcGxhY2Vob2xkZXI=";

export const MOCK_TXID =
  "0000000000000000000mockmocktxidmocktxidmocktxidmocktxidmock1234";

// Signature placeholder over the quote payload (spec §7.1 signed quote).
export const MOCK_QUOTE_SIGNATURE =
  "mock_sig_304402207f9c3b0a1e2d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9";

const CALADAN_ID = "11111111-1111-4111-8111-111111111111";
const QBTC_ID = "22222222-2222-4222-8222-222222222222";

export const INSTANCE_IDS = { caladan: CALADAN_ID, qbtc: QBTC_ID };

function isoNow(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

// ---------------------------------------------------------------------------
// Claim ratios
// ---------------------------------------------------------------------------

// Caladan — BTC-returning. Ratio hovers just above 0.001 BTC/RT (RT priced
// ~1000 per BTC), drifting up as yield accrues into the reserve.
export function caladanClaimRatio(): ClaimRatio {
  return {
    btc_per_rt: "0.00100240",
    rt_per_btc: "997.60",
    btc_yp_sats: 4_120_000_000, // ~41.2 BTC in the YP reserve
    btc_buffer_sats: 380_000_000, // ~3.8 BTC liquid buffer
    rt_total: "4500000000000",
    rt_vault: "210000000000",
    rt_circulating: "4290000000000",
    as_of_at: isoNow(),
  };
}

// qBTC — asset-backed. Priced off a fund NAV feed; carries nav fields.
export function qbtcClaimRatio(): ClaimRatio {
  return {
    btc_per_rt: "0.00104880",
    rt_per_btc: "953.47",
    btc_yp_sats: 2_760_000_000, // ~27.6 BTC-equivalent backing
    btc_buffer_sats: 140_000_000,
    rt_total: "2100000000000",
    rt_vault: "180000000000",
    rt_circulating: "1920000000000",
    as_of_at: isoNow(),
    nav_usd_per_unit: "1.0432",
    nav_source: "upstream-alpha-fund-nav-v1",
  };
}

// ---------------------------------------------------------------------------
// Instances
// ---------------------------------------------------------------------------

export function caladanInstance(): SolsticeInstance {
  return {
    instance_id: CALADAN_ID,
    slug: "caladan",
    name: "Caladan",
    yp_type: "btc_returning",
    network: "testnet",
    receipt_rune: {
      rune_id: "840000:3",
      ticker: "CALADAN•RT",
      symbol: "◆",
      divisibility: 8,
    },
    claim_ratio: caladanClaimRatio(),
    reserve_status: {
      layer1: { btc_yp_sats: 4_120_000_000, as_of_at: isoNow(), stale: false },
      layer2: {
        enabled: true, // Vault track
        attested_backing_sats: 4_118_400_000,
        attestation_at: isoNow(-6 * 60 * 1000), // attested 6 min ago
        stale: false,
        threshold_ms: 60 * 60 * 1000, // 1h freshness threshold
      },
      investment_paused: false,
      paused_reason: null,
    },
    redemption: {
      instant_available: true,
      cycle_ms: 24 * 60 * 60 * 1000, // daily cycle
      next_settlement_at: isoNow(8 * 60 * 60 * 1000),
    },
    min_invest_sats: 100_000, // 0.001 BTC
    min_redeem_rt: "1000000000",
    is_active: true,
  };
}

export function qbtcInstance(): SolsticeInstance {
  return {
    instance_id: QBTC_ID,
    slug: "qbtc",
    name: "qBTC",
    yp_type: "asset_backed",
    network: "testnet",
    receipt_rune: {
      rune_id: "840100:7",
      ticker: "QBTC",
      symbol: "₿",
      divisibility: 8,
    },
    claim_ratio: qbtcClaimRatio(),
    reserve_status: {
      layer1: { btc_yp_sats: 2_760_000_000, as_of_at: isoNow(), stale: false },
      layer2: {
        enabled: false, // Layer-1 only (asset-backed NAV read)
        attested_backing_sats: null,
        attestation_at: null,
        stale: false,
        threshold_ms: 60 * 60 * 1000,
      },
      investment_paused: false,
      paused_reason: null,
    },
    redemption: {
      instant_available: false, // buffer thin → redemptions queue
      cycle_ms: 7 * 24 * 60 * 60 * 1000, // weekly cycle
      next_settlement_at: isoNow(3 * 24 * 60 * 60 * 1000),
    },
    min_invest_sats: 250_000, // 0.0025 BTC
    min_redeem_rt: "2000000000",
    is_active: true,
  };
}

export function allInstances(): SolsticeInstance[] {
  return [caladanInstance(), qbtcInstance()];
}

// Resolve an instance by either its uuid or its slug (the mock accepts both so
// dashboard links can be human-readable).
export function findInstance(idOrSlug: string): SolsticeInstance | undefined {
  return allInstances().find(
    (i) => i.instance_id === idOrSlug || i.slug === idOrSlug,
  );
}

// ---------------------------------------------------------------------------
// Reservations (queued-settlement fixtures, spec §5.3)
// ---------------------------------------------------------------------------

export function mockReservations(address: string): Reservation[] {
  return [
    {
      reservation_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      request_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      address,
      amount_rt: "1000000000",
      payout_sats: 998_800,
      status: "claimable",
      claimable_at: isoNow(-30 * 60 * 1000),
      reclaim_after_at: isoNow(3 * 24 * 60 * 60 * 1000),
      outpoint: `${MOCK_TXID}:0`,
    },
  ];
}
