# Ember — app

The mobile app. Keeps the people you love from going cold; hands you off to real conversations.

This is a working Expo (React Native) scaffold: Today / Circle / Person screens, the glow signature, AI-drafted openers, and a one-tap hand-off to your real Messages.

---

## Run it (15 minutes)

You'll need Node 18+ and a phone with the **Expo Go** app (App Store / Play Store).

**Safest path — generate a fresh Expo shell, then drop in the source** (this guarantees current, compatible versions):

```bash
npx create-expo-app ember --template blank-typescript
cd ember
npx expo install react-native-safe-area-context
# copy this repo's App.tsx and the whole src/ folder over the new project's
# then:
npx expo start
```

Scan the QR code with Expo Go. The app boots with seeded people so you can feel the loop immediately.

**Or just try this folder directly:**
```bash
npm install
npx expo start
```
(If install complains about versions, run `npx expo install --fix`, or use the fresh-shell path above.)

---

## Turn on real AI drafting

By default, "Help me reach out" uses written fallbacks. To make it generate live:

1. Deploy `server/anthropic-proxy.ts` as a serverless function (Vercel is easiest — drop it at `/api/draft.ts`).
2. Add your key: `vercel env add ANTHROPIC_API_KEY`, then `vercel deploy`.
3. In the app, set `EXPO_PUBLIC_EMBER_API_URL` (in `.env` or your Expo config) to that endpoint.

The key lives only on the server. The app never sees it.

---

## What's built vs. what's next

**Built:** the three screens, glow component, warmth math, AI draft → SMS hand-off, the "real conversations" metric, seeded demo data.

**Next (good first Claude Code tasks):**
1. **Persistence** — swap the in-memory store for `expo-sqlite` (local-first; people stay on device). See `src/data/store.ts`.
2. **The #2 problem** — frictionless capture: a voice note or a few words that the AI digests into `goingOn` / `worthKnowing` / dates. This is the make-or-break feature.
3. **Onboarding** — add 3–8 people from contacts; set cadence per person.
4. **Morning push** — `expo-notifications` to deliver the daily "who's going cold" nudge.
5. **Fonts** — load Fraunces via `@expo-google-fonts/fraunces` so `SERIF` renders (see `src/theme.ts`).

---

## Working with Claude Code

Open this folder in Claude Code and keep `../EMBER-BRIEF.md` nearby (or paste it in as `CLAUDE.md`) so every session has the full concept, wedge, and the three rules. Good opening prompt:

> Read CLAUDE.md and the src/ folder. Implement task #1 (expo-sqlite persistence) from the README's "Next" list, keeping the existing screens working.

---

## The three rules (don't let these slip)

1. **Small circle** — depth, not a network.
2. **Under 30 seconds** to log anything — the AI does the remembering.
3. **Warmth, not a spreadsheet** — it should feel like love, and it wins when you close it.
