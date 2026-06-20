import { Person, ImportantDate } from "../data/types";

// Capture endpoint (see server/anthropic-proxy.ts → captureHandler). As with
// drafting, the key stays server-side; only this one person + the raw note are
// sent — never the rest of the user's circle.
const EMBER_CAPTURE_URL =
  process.env.EXPO_PUBLIC_EMBER_CAPTURE_URL || "https://YOUR-PROXY.vercel.app/api/capture";

export type CaptureResult = {
  goingOn: string;
  worthKnowing: string;
  dates: ImportantDate[];
  historyEntry: string;
};

// Digest a quick raw note into structured updates. On any failure we keep what
// we already know and just log that a conversation happened — capture should
// never lose the user's note or block the flow.
export async function parseCapture(person: Person, rawNote: string): Promise<CaptureResult> {
  const fallback: CaptureResult = {
    goingOn: person.goingOn,
    worthKnowing: person.worthKnowing,
    dates: person.dates,
    historyEntry: `You connected with ${person.name}.`,
  };

  try {
    const res = await fetch(EMBER_CAPTURE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personName: person.name,
        relationship: person.relationship,
        currentGoingOn: person.goingOn,
        currentWorthKnowing: person.worthKnowing,
        currentDates: person.dates,
        currentHistory: person.history,
        rawNote,
      }),
    });
    if (!res.ok) throw new Error("capture proxy error");
    const data = await res.json();

    return {
      goingOn: typeof data?.goingOn === "string" ? data.goingOn : fallback.goingOn,
      worthKnowing:
        typeof data?.worthKnowing === "string" ? data.worthKnowing : fallback.worthKnowing,
      dates: Array.isArray(data?.dates) ? (data.dates as ImportantDate[]) : fallback.dates,
      historyEntry:
        typeof data?.historyEntry === "string" && data.historyEntry.trim()
          ? data.historyEntry.trim()
          : fallback.historyEntry,
    };
  } catch {
    return fallback;
  }
}
