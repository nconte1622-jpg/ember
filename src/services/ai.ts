import { Person } from "../data/types";

// Your deployed proxy URL (see /server/anthropic-proxy.ts). Never call Anthropic
// directly from the app — the API key must stay server-side.
const EMBER_API_URL =
  process.env.EXPO_PUBLIC_EMBER_API_URL || "https://YOUR-PROXY.vercel.app/api/draft";

const FALLBACK: Record<string, string> = {
  "1": "Hey Mom — thinking about you with the 24th coming up. No need to talk if you're mid-show, just wanted you to know I'm in your corner. Call you tomorrow?",
  "2": "Theo. First apartment, new city — how's it actually feeling? Not the highlight-reel version. Miss you out here.",
  "3": "Grandpa, I want to get the Okinawa story on tape before I forget a single detail. Free for a call tomorrow morning?",
  "4": "Priya — Friday's the day. Your eye for the quiet moments is the whole reason this show exists. Thinking about you walking in.",
  "5": "Coach — heard this is your last season. Couldn't let it pass without telling you what that recruiting letter meant. It changed everything.",
};

export async function draftOpener(person: Person): Promise<string> {
  try {
    const res = await fetch(EMBER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: person.name,
        relationship: person.relationship,
        goingOn: person.goingOn,
        worthKnowing: person.worthKnowing,
        daysSince: person.daysSince,
      }),
    });
    if (!res.ok) throw new Error("proxy error");
    const data = await res.json();
    const text = (data?.message || "").trim();
    if (text) return text;
    throw new Error("empty");
  } catch {
    return FALLBACK[person.id] || "Been thinking about you — got a few minutes to catch up this week?";
  }
}
