// The smallest deposit the dashboard will build.
//
// /api/btc-staking splits a deposit into two script outputs: a quarter to the
// escrow (claimable by the yield provider) and three quarters to the user's
// timelock. Standard relay policy, which mainnet nodes apply, drops any
// segwit script output below 330 sats as dust, so the escrow's quarter has to
// clear that: at least 1,320 sats in all. 0.00002 BTC (2,000 sats, a 500-sat
// escrow) leaves headroom and is a round number to show users.
export const DUST_LIMIT_SATS = 330;
export const ESCROW_SHARE = 1 / 4;
export const MIN_STAKE_BTC = 0.00002;
export const MIN_STAKE_SATS = Math.round(MIN_STAKE_BTC * 1e8);
