import { Person } from "./types";

export const SEED: Person[] = [
  {
    id: "1", name: "Mom", relationship: "your mother", cadence: 7, daysSince: 19,
    goingOn: "Her knee replacement is scheduled for the 24th. Nervous about recovery, won't say so.",
    worthKnowing: "Hates the phone ringing during her shows (7–9pm). Loves a voice note.",
    dates: [{ label: "Surgery", when: "Jun 24" }],
    history: ["You called after her doctor's appointment — she downplayed it.", "Sent her photos from the meet."],
  },
  {
    id: "2", name: "Theo", relationship: "best friend from home", cadence: 14, daysSince: 33,
    goingOn: "Just moved to Denver for the new job. First time living alone. Quietly homesick.",
    worthKnowing: "Texts back faster than he calls. Big into the Nuggets right now.",
    dates: [],
    history: ["Helped him pick between the two offers in April.", "You've gone quiet since he moved."],
  },
  {
    id: "3", name: "Grandpa Sal", relationship: "your grandfather", cadence: 10, daysSince: 8,
    goingOn: "Telling the Navy stories again. You keep meaning to record one.",
    worthKnowing: "Sharpest in the late morning. Calls beat texts — he doesn't really text.",
    dates: [{ label: "Birthday", when: "Aug 2" }],
    history: ["Called Sunday — told the Okinawa story for the third time and you let him.", "Promised you'd visit before fall."],
  },
  {
    id: "4", name: "Priya", relationship: "college roommate", cadence: 21, daysSince: 12,
    goingOn: "Her photography show opens Friday. First solo exhibition — terrified and thrilled.",
    worthKnowing: "Loves a specific, not-generic compliment. Hates 'good luck!' texts.",
    dates: [{ label: "Show opens", when: "Fri" }],
    history: ["She talked you through the breakup in March.", "You owe her a real catch-up call."],
  },
  {
    id: "5", name: "Coach Marin", relationship: "high school coach", cadence: 45, daysSince: 51,
    goingOn: "Retiring at the end of this season after 28 years. Last home game is soon.",
    worthKnowing: "Would never ask you to reach out. Would mean the world if you did.",
    dates: [],
    history: ["Wrote your recruiting letter.", "You haven't talked since you committed."],
  },
];
