import { NextRequest, NextResponse } from "next/server";

import { chainConfigs, type SupportedChain } from "@/lib/multichain";
import {
  MECHANISM_COMING_SOON,
  defaultMechanismFor,
  isKnownMechanismId,
  isMechanismAvailableFor,
  mechanismCovers,
  transferMechanism,
} from "@/lib/transfer/mechanisms";
import { initiate } from "@/lib/transfer/mock-service";
import { resolveTransferRoute } from "@/lib/transfer/routes";
import {
  proxyToTransferService,
  transferError,
  transferServiceUrl,
} from "@/lib/transfer/service";
import type {
  TransferInitiateRequest,
  TransferInitiateResponse,
  TransferInitiateSuccessResponse,
} from "../types";

// Opens a transfer. What that means depends on where it is going: a charms beam
// builds a placeholder on the L2 and returns an unsigned lock; an ordinary send
// just returns an unsigned transaction.
//
// The route is re-resolved here from the chain pair rather than taken from the
// request. The client resolves the same pair to describe the transfer as the
// user builds it, but a client-declared route kind would be a client-declared
// trust model — the beam's threshold authorization is not something a caller
// gets to opt into.

export const dynamic = "force-dynamic";

const isSupportedChain = (value: unknown): value is SupportedChain =>
  typeof value === "string" && value in chainConfigs;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<TransferInitiateResponse>> {
  let body: Partial<TransferInitiateRequest>;
  try {
    body = (await request.json()) as Partial<TransferInitiateRequest>;
  } catch {
    return transferError(400, "INTERNAL", "Expected a JSON body.");
  }

  const { fromChain, toChain, amount } = body;

  if (!isSupportedChain(fromChain) || !isSupportedChain(toChain)) {
    return transferError(
      400,
      "CHAIN_INVALID",
      "Both a source and a destination chain are required.",
    );
  }

  const route = resolveTransferRoute(fromChain, toChain);
  if (route.kind === "unsupported") {
    return transferError(
      400,
      "ROUTE_UNSUPPORTED",
      route.unavailableReason ?? "There is no route between these chains.",
    );
  }

  const fromAddress = body.fromAddress?.trim() ?? "";
  const toAddress = body.toAddress?.trim() ?? "";

  // Prefix-only checks. Each chain's own node re-validates properly; this
  // exists to reject an address pasted for the wrong network before anything
  // irreversible is built from it.
  if (!fromAddress.startsWith(chainConfigs[fromChain].addressPrefix)) {
    return transferError(
      400,
      "ADDRESS_INVALID",
      `The source address is not a ${chainConfigs[fromChain].name} address.`,
    );
  }
  if (!toAddress.startsWith(chainConfigs[toChain].addressPrefix)) {
    return transferError(
      400,
      "ADDRESS_INVALID",
      `The destination address is not a ${chainConfigs[toChain].name} address.`,
    );
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return transferError(400, "AMOUNT_INVALID", "Enter an amount to transfer.");
  }

  // Per-chain minimum rather than one global floor: the L2 represents 6dp and
  // Bitcoin 8dp, so a single constant would either be dust on one or block
  // legitimate amounts on the other.
  const minimum = chainConfigs[fromChain].minDeposit;
  if (amount < minimum) {
    return transferError(
      400,
      "AMOUNT_INVALID",
      `The minimum transfer from ${chainConfigs[fromChain].name} is ${minimum} ${chainConfigs[fromChain].symbol}.`,
    );
  }

  // Mechanism selection is re-checked here, not trusted from the client. The
  // client disables unavailable options in the picker, but a disabled option in
  // a form is a hint, not a control — an unimplemented mechanism must be refused
  // by the thing that would otherwise act on it. The direction check matters
  // just as much: a mechanism that only carries peg-in must not be accepted for
  // a peg-out just because it is available.
  const direction = route.direction;
  let mechanism = direction
    ? defaultMechanismFor(direction, route.baseChain)
    : null;

  if (direction && body.mechanism !== undefined) {
    if (!isKnownMechanismId(body.mechanism)) {
      return transferError(400, "MECHANISM_UNAVAILABLE", "Unknown transfer route.");
    }
    const named = transferMechanism(body.mechanism);
    // Does not address this direction at all — a different fact from "not yet",
    // and worth saying differently.
    if (!mechanismCovers(body.mechanism, direction, route.baseChain)) {
      return transferError(
        400,
        "MECHANISM_UNAVAILABLE",
        `${named?.name ?? "That route"} does not carry transfers on this route.`,
      );
    }
    // Addresses it, but not yet. Charms peg-out is the live example: available
    // for peg-in, pending for peg-out, so availability has to be checked per
    // direction rather than per mechanism.
    if (
      !isMechanismAvailableFor(body.mechanism, direction, route.baseChain)
    ) {
      return transferError(
        400,
        "MECHANISM_UNAVAILABLE",
        `${named?.name ?? "That route"}: ${MECHANISM_COMING_SOON.toLowerCase()} for this direction.`,
      );
    }
    mechanism = body.mechanism;
  }

  // A direction with nothing implementing it yet — peg-out today. The pair is a
  // real route, so this is not ROUTE_UNSUPPORTED; there is simply no mechanism.
  if (
    direction &&
    (!mechanism || !isMechanismAvailableFor(mechanism, direction, route.baseChain))
  ) {
    return transferError(
      400,
      "MECHANISM_UNAVAILABLE",
      `No transfer route is available for this direction yet. ${MECHANISM_COMING_SOON}.`,
    );
  }

  const payload: TransferInitiateRequest = {
    fromChain,
    toChain,
    fromAddress,
    toAddress,
    amount,
    ...(mechanism ? { mechanism } : {}),
  };

  const baseUrl = transferServiceUrl();
  if (baseUrl) {
    return proxyToTransferService<TransferInitiateSuccessResponse>(
      baseUrl,
      "/v1/transfer/initiate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  }

  try {
    return NextResponse.json(await initiate(payload), { status: 201 });
  } catch (e) {
    console.error("Transfer initiate failed:", e);
    return transferError(
      500,
      "INTERNAL",
      "The transfer could not be opened. Please try again.",
    );
  }
}
