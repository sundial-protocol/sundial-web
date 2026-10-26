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
  });
  posthog.register({ product: "website" });
}
