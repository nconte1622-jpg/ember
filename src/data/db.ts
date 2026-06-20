import * as SQLite from "expo-sqlite";
import { Person, ImportantDate } from "./types";
import { SEED } from "./seed";
import { CaptureResult } from "../services/capture";

// Local-first, privacy-by-default: a person's circle and what's happening in
// their lives never leaves the device. Only the minimal drafting/capture
// request goes to the proxy (see src/services). Nothing here is transmitted.

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync("ember.db");
  return dbPromise;
}

const MIGRATION = `
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  cadence INTEGER NOT NULL,
  days_since INTEGER NOT NULL,
  going_on TEXT NOT NULL,
  worth_knowing TEXT NOT NULL,
  dates TEXT NOT NULL,
  history TEXT NOT NULL
);`;

// dates and history are stored as JSON text columns.
type Row = {
  id: string;
  name: string;
  relationship: string;
  cadence: number;
  days_since: number;
  going_on: string;
  worth_knowing: string;
  dates: string;
  history: string;
};

function safeParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function rowToPerson(r: Row): Person {
  return {
    id: r.id,
    name: r.name,
    relationship: r.relationship,
    cadence: r.cadence,
    daysSince: r.days_since,
    goingOn: r.going_on,
    worthKnowing: r.worth_knowing,
    dates: safeParse<ImportantDate[]>(r.dates, []),
    history: safeParse<string[]>(r.history, []),
  };
}

// Open the DB, run the one migration, and seed the demo circle on first open.
export async function initDB(): Promise<void> {
  const db = await getDB();
  await db.execAsync(MIGRATION);
  const row = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM people");
  if (!row || row.n === 0) {
    for (const p of SEED) await upsertPerson(p);
  }
}

export async function getAllPeople(): Promise<Person[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<Row>("SELECT * FROM people");
  return rows.map(rowToPerson);
}

export async function upsertPerson(p: Person): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO people (id, name, relationship, cadence, days_since, going_on, worth_knowing, dates, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       relationship = excluded.relationship,
       cadence = excluded.cadence,
       days_since = excluded.days_since,
       going_on = excluded.going_on,
       worth_knowing = excluded.worth_knowing,
       dates = excluded.dates,
       history = excluded.history`,
    [
      p.id,
      p.name,
      p.relationship,
      p.cadence,
      p.daysSince,
      p.goingOn,
      p.worthKnowing,
      JSON.stringify(p.dates),
      JSON.stringify(p.history),
    ]
  );
}

// The only event that matters: a real conversation happened.
export async function markReachedDB(id: string): Promise<void> {
  const db = await getDB();
  const row = await db.getFirstAsync<Row>("SELECT * FROM people WHERE id = ?", [id]);
  if (!row) return;
  const history = safeParse<string[]>(row.history, []);
  const next = ["You reached out today.", ...history];
  await db.runAsync("UPDATE people SET days_since = 0, history = ? WHERE id = ?", [
    JSON.stringify(next),
    id,
  ]);
}

// Persist the AI's digest of a raw note: refresh what's going on / worth
// knowing / their dates, and prepend the new moment to the shared history.
export async function applyCapture(id: string, result: CaptureResult): Promise<void> {
  const db = await getDB();
  const row = await db.getFirstAsync<Row>("SELECT * FROM people WHERE id = ?", [id]);
  if (!row) return;
  const history = safeParse<string[]>(row.history, []);
  const next = [result.historyEntry, ...history];
  await db.runAsync(
    "UPDATE people SET going_on = ?, worth_knowing = ?, dates = ?, history = ? WHERE id = ?",
    [result.goingOn, result.worthKnowing, JSON.stringify(result.dates), JSON.stringify(next), id]
  );
}
