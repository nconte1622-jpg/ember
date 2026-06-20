// Two serverless routes live here. On Vercel, give each its own file so the
// file-based router exposes both endpoints:
//
//   /api/draft.ts    →  export { default } from "../server/anthropic-proxy";
//   /api/capture.ts  →  export { captureHandler as default } from "../server/anthropic-proxy";
//
// The ANTHROPIC_API_KEY stays here, on the server — never in the mobile app.
//
//   vercel env add ANTHROPIC_API_KEY
//   vercel deploy
//
// Then point the app at them:
//   EXPO_PUBLIC_EMBER_API_URL      → the /api/draft URL
//   EXPO_PUBLIC_EMBER_CAPTURE_URL  → the /api/capture URL
//
// Privacy: only the single person + raw note needed for THIS request is sent.
// The user's full circle never leaves the device.

// ── /api/draft — turn What we know about someone into one opener ──────────────
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { name, relationship, goingOn, worthKnowing, daysSince } = req.body || {};

  const prompt = `You help someone reach out warmly to people they love. Write ONE short, specific, human opening message (under 45 words) they could text right now. No greeting clichés, no "good luck", no emojis unless natural. Sound like a real person who cares, not a card.

Person: ${name} (${relationship})
What's going on with them: ${goingOn}
Worth knowing: ${worthKnowing}
It's been ${daysSince} days since they last connected.

Return ONLY the message text, nothing else.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      