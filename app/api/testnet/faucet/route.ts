import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import type {
  FaucetClaimCode,
  FaucetClaimErrorResponse,
  FaucetClaimResponse,
} from "./types";

// Single integration point between sundial-web and the Sundial faucet.
//
// The browser POSTs only a recipient address. This route derives an
// idempotency key and a hashed IP, then forwards the request to the faucet's
// `POST /faucet/claims` endpoint with the server-side bearer key. The faucet key
// and faucet URL never reach the client, and backend error details are sanitized
// before being returned to the UI.

// Faucet payouts are never cached.
export const dynamic = "force-dynamic";

// Trim a trailing slash so we can safely append the endpoint path.
const faucetBaseUrl = (): string | null => {
  const raw = process.env.SUNDIAL_L2_NODE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
};

const error = (
  status: number,
  code: FaucetClaimCode,
  message: string,
  nextEligibleAt?: string,
): NextResponse<FaucetClaimResponse> => {
  const body: FaucetClaimErrorResponse = { error: message, code };
  if (nextEligibleAt) body.nextEligibleAt = nextEligibleAt;
  return NextResponse.json(body, { status });
};

// Derives the client IP from proxy headers (Vercel/most reverse proxies set
// `x-forwarded-for` as a comma-separated list, client first). Falls back to
// `x-real-ip`, then to a constant so the faucet always receives a non-empty hash.
const clientIp = (request: NextRequest): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

// Hash the IP so the faucet only ever stores an opaque identifier.
// Set `FAUCET_IP_HASH_SALT` to avoid the hash being precomputable from public IP ranges.
const hashIp = (ip: string): string => {
  const salt = process.env.FAUCET_IP_HASH_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
};

export async function POST(
  request: NextRequest,
): Promise<NextResponse<FaucetClaimResponse>> {
  const baseUrl = faucetBaseUrl();
  const apiKey = process.env.MIDGARD_FAUCET_API_KEY;
  if (!baseUrl || !apiKey) {
    return error(
      503,
      "NOT_CONFIGURED",
      "The faucet is not configured on this deployment.",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "ADDRESS_INVALID", "Request body must be valid JSON.");
  }
  if (typeof body !== "object" || body === null) {
    return error(400, "ADDRESS_INVALID", "Request body must be a JSON object.");
  }

  const { address, idempotencyKey: clientKey } = body as Record<
    string,
    unknown
  >;
  if (typeof address !== "string" || address.trim().length === 0) {
    return error(400, "ADDRESS_INVALID", "A recipient address is required.");
  }

  // The browser may pass a stable key so retries dedupe; otherwise generate one.
  const idempotencyKey =
    typeof clientKey === "string" && clientKey.trim().length > 0
      ? clientKey.trim()
      : randomUUID();
  const ipHash = hashIp(clientIp(request));

  let faucetResponse: Response;
  try {
    faucetResponse = await fetch(`${baseUrl}/faucet/claims`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        address: address.trim(),
        idempotencyKey,
        ipHash,
      }),
      cache: "no-store",
    });
  } catch (e) {
    console.error("Faucet request failed:", e);
    return error(
      502,
      "NODE_UNAVAILABLE",
      "The faucet is currently unreachable. Please try again shortly.",
    );
  }

  let faucetBody: Record<string, unknown> = {};
  try {
    faucetBody = (await faucetResponse.json()) as Record<string, unknown>;
  } catch {
    // Non-JSON response (e.g. a gateway error page) — fall through to the
    // status-based handling below with an empty body.
  }

  if (faucetResponse.ok) {
    return NextResponse.json({
      success: true,
      claimId: String(faucetBody.claimId ?? ""),
      txHash: String(faucetBody.txHash ?? ""),
      amount: String(faucetBody.amount ?? ""),
      nextEligibleAt: String(faucetBody.nextEligibleAt ?? ""),
    });
  }

  // Sanitize backend errors. For client-actionable statuses (4xx) we pass through
  // the faucet's code, message and cooldown hint. For server-side failures we
  // return a generic message so internal details never reach the browser.
  const code =
    typeof faucetBody.code === "string"
      ? (faucetBody.code as FaucetClaimCode)
      : "INTERNAL";
  const nextEligibleAt =
    typeof faucetBody.nextEligibleAt === "string"
      ? faucetBody.nextEligibleAt
      : undefined;

  if (faucetResponse.status >= 500) {
    // DEPLETED (503) is a distinct, user-facing state; everything else 5xx is
    // collapsed into a generic failure so internal details never leak.
    if (code === "DEPLETED") {
      return error(
        503,
        "DEPLETED",
        "The faucet is temporarily out of funds. Please try again later.",
      );
    }
    return error(
      faucetResponse.status,
      "INTERNAL",
      "The faucet request failed. Please try again later.",
    );
  }

  if (faucetResponse.status === 404) {
    // The backend reports a disabled faucet as 404 to make it indistinguishable
    // from a missing route; present it as a configuration/availability issue.
    return error(503, "DISABLED", "The faucet is currently unavailable.");
  }

  const message =
    typeof faucetBody.error === "string"
      ? faucetBody.error
      : "The faucet request could not be completed.";
  return error(faucetResponse.status, code, message, nextEligibleAt);
}
