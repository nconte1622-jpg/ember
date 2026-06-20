import { Person } from "./types";

// warmth: 1 (glowing) → ~0 (gone cold), from days-since vs the chosen cadence.
export function warmth(daysSince: number, cadence: number): number {
  const ratio = daysSince / cadence;
  if (ratio <= 0.5) return 1;
  if (ratio >= 2) return 0.08;
  return Math.max(0.08, 1 - (ratio - 0.5) / 1.5);
}

export function warmthLabel(w: number): string {
  return w > 0.66 ? "warm" : w > 0.33 ? "cooling" : "going cold";
}

// coldest first — who needs you most
export function byUrgency(people: Person[]): Person[] {
  return [...people].sort((a, b) => warmth(a.daysSince, a.cadence) - warmth(b.daysSince, b.cadence));
}

export function cooling(people: Person[]): Person[] {
  return byUrgency(people).filter((p) => warmth(p.daysSince, p.cadence) < 0.66);
}

// Mark a real conversation happened — the only event that matters.
export function markReached(people: Person[], id: string): Person[] {
  return people.map((p) =>
    p.id === id ? { ...p, daysSince: 0, history: ["You reached out today.", ...p.history] } : p
  );
}

/*
 * PERSISTENCE — a next step for Claude Code:
 * Replace this module's in-memory usage with expo-sqlite (local-first, privacy-by-default).
 * Person stays on device. Only AI drafting calls leave the phone, via the proxy in /server.
 */
