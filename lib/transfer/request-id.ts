import { randomBytes } from "crypto";

// Transfer ids, shared by the mock and live orchestrators so both mint and
// parse them the same way.
//
// `tfr_<createdAt base36>_<random>`. The timestamp is encoded so a lookup miss
// can tell "never existed" from "existed, and this process no longer has it" —
// the second is a restart, and the UI can say so instead of blaming the user.

export const mintTransferId = (createdAt: number): string =>
  `tfr_${createdAt.toString(36)}_${randomBytes(9).toString("hex")}`;

// Epoch ms for 2020-01-01. Anything decoding to earlier than this is arbitrary
// base36 that happens to parse, not an id we minted — without the floor, a
// string like "tfr_zzzzz_x" decodes to 1971 and gets told its transfer expired.
const PLAUSIBLE_EPOCH_FLOOR_MS = 1_577_836_800_000;

export const createdAtFromId = (id: string): number | null => {
  const [prefix, part] = id.split("_");
  if (prefix !== "tfr" || !part) return null;
  const parsed = Number.parseInt(part, 36);
  if (!Number.isFinite(parsed)) return null;
  // Allow a little slack ahead of now for clock skew between processes.
  const ceiling = Date.now() + 60_000;
  return parsed >= PLAUSIBLE_EPOCH_FLOOR_MS && parsed <= ceiling ? parsed : null;
};

export const wasMintedHere = (id: string): boolean =>
  createdAtFromId(id) !== null;
