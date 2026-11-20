// Runs once in the browser before the app hydrates (Next.js 15.3+).
// Event names and privacy rules: docs-v2 operations/analytics.md
import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Only environments with the key set report, so local dev and Vercel
// previews stay out of the Sundial project unless someone opts in.
if (key) {
  posthog.init(key, {
    // Proxied through next.config.mjs so ad blockers don't drop events.
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24",
    person_profiles: "identified_only",
    disable_session_recording: true,
    // Autocapture records the href and text of whatever is clicked, which on
    // the dashboard includes explorer links (txids) and the balance button (an
    // exact amount). The events we send ourselves are the ones that matter.
    // Dead-click capture records the same element details, so it goes too.
    autocapture: false,
    capture_dead_clicks: false,
    // Runs inside init(), before the first automatic $pageview.
    loaded: (ph) => {
      // Start every visit anonymous. PostHog keeps the last wallet's ID across
      // reloads, so without this a visitor whose wallet isn't restored, or who
      // connects a different one, would be counted as the previous wallet.
      // WalletIdentity identifies again when a wallet connects, which merges
      // this visit's anonymous events in. Wallet IDs start with "w_"
      // (app/api/analytics/wallet-id/route.ts).
      if (ph.get_distinct_id().startsWith("w_")) ph.reset();
      ph.register({ product: "website" });
    },
  });
}
