/**
 * Server-side helper for calling the Sundial btc-yield backend.
 *
 * Reads SUNDIAL_API_URL from the environment at call-time so it works
 * correctly across Next.js server restarts without caching a stale value.
 *
 * Local dev:  SUNDIAL_API_URL=http://localhost:8080  (Docker Compose)
 * Production: SUNDIAL_API_URL=https://api.testnet.sundialprotocol.com  (AWS)
 */

function getBaseUrl(): string {
  const url = process.env.SUNDIAL_API_URL;
  if (!url) {
    throw new Error(
      "SUNDIAL_API_URL is not set. Add it to .env (e.g. https://api.testnet.sundialprotocol.com) or set it in your .",
    );
  }
  // Strip trailing slash for consistent path joining
  return url.replace(/\/+$/, "");
}

/**
 * Make a typed request to the Sundial backend API.
 *
 * Throws on non-2xx responses with the body text as the error message
 * so callers can surface meaningful backend validation errors.
 */
export async function sundialFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;

  console.log("🔄 sundialFetch:", { method: init?.method || "GET", url });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  // Forward bearer token if configured (needed when backend auth is enabled)
  const token = process.env.SUNDIAL_API_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  console.log("📡 sundialFetch response:", {
    status: res.status,
    statusText: res.statusText,
  });

  if (!res.ok) {
    // Try to extract a JSON error body; fall back to status text
    let detail: string;
    try {
      const body = await res.json();
      detail = body.message ?? body.error ?? JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => res.statusText);
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}
