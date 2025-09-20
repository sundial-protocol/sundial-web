import { Asset } from "@sundial-protocol/ada-locker";

export function lovelaceToAssets(lovelace: number): Asset[] {
  return [{ unit: "lovelace", quantity: lovelace.toString() }];
}
