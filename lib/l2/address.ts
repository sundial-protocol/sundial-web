// Cheap shape check for a Sundial L2 (Cardano-isomorphic) bech32 payment
// address.
//
// This rejects obvious junk before a network call; it is not a substitute for
// real validation. The L2 node re-checks through Lucid's `getAddressDetails`
// and rejects addresses with no payment credential, so anything that gets past
// this and is still wrong comes back as a clean 400 from the node.
//
// Note: app/api/testnet/utxos/route.ts carries its own inline copy of this
// regex. That copy predates this module and has uncommitted edits in flight, so
// it was left alone rather than folded in here.
export const isBech32PaymentAddress = (address: string): boolean =>
  /^addr(_test)?1[0-9ac-hj-np-z]{10,}$/.test(address);
