// Which implementation answers the transfer routes.
//
// Three, in precedence order:
//
//   1. `TRANSFER_API_URL` set  → proxy an external transfer service. Nothing in
//      this repo runs; the service owns the whole flow.
//   2. `TRANSFER_MODE=live`    → run the local implementation against real
//      infrastructure: the Sundial L2 node and the Scrolls canister.
//   3. otherwise               → the mock orchestrator, on a timer.
//
// `live` is deliberately not the default. It touches a real ledger and a real
// canister, and it is only partly implemented — the pieces that do not exist
// yet refuse rather than fake, so a deployment that flipped to live by accident
// would break loudly, but breaking loudly is still breaking.

export type TransferMode = "mock" | "live";

export const transferMode = (): TransferMode =>
  process.env.TRANSFER_MODE?.trim().toLowerCase() === "live" ? "live" : "mock";

export const isLiveMode = (): boolean => transferMode() === "live";
