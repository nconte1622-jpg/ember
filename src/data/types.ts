export type ImportantDate = { label: string; when: string };

export type Person = {
  id: string;
  name: string;
  relationship: string;
  cadence: number;        // target days between contact
  daysSince: number;      // days since last real contact
  goingOn: string;        // what's happening in their life right now
  worthKnowing: string;   // how to reach them well
  dates: ImportantDate[];
  history: string[];      // recent moments between you (newest first)
};
