import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { C, SERIF } from "../theme";
import { Person } from "../data/types";
import { warmth, cooling } from "../data/store";
import Glow from "../components/Glow";

type Props = {
people: Person[];
reachedToday: number;
onReachOut: (p: Person) => void;
onOpenPerson: (p: Person) => void;
};

export default function TodayScreen({ people, reachedToday, onReachOut, onOpenPerson }: Props) {
const cool = cooling(people);
const top = cool[0];
const also = cool.slice(1, 4);
const hr = new Date().getHours();
const greeting = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";

return (
<ScrollView style={{ flex: 1, backgroundColor: C.linen }} contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 40 }}>
<Text style={[s.brand, { fontFamily: SERIF }]}>Ember</Text>
<Text style={s.greet}>{greeting}, Nico.</Text>

{top ? (
<>
<Text style={s.eyebrow}>REACH OUT TODAY</Text>
<View style={s.card}>
<View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
<Glow size={86} w={warmth(top.daysSince, top.cadence)} />
<View style={{ flex: 1, paddingTop: 4 }}>
<Text style={[s.name, { fontFamily: SERIF }]}>{top.name}</Text>
<Text style={s.meta}>{top.daysSince} days quiet · {top.relationship}</Text>
</View>
</View>
<Text style={s.body}>{top.goingOn}</Text>
<Text style={s.know}>{top.worthKnowing}</Text>
<Pressable style={s.primary} onPress={() => onReachOut(top)}>
<Text style={s.primaryText}>Help me reach out</Text>
</Pressable>
<Pressable onPress={() => onOpenPerson(top)}>
<Text style={s.secondaryLink}>See everything about {top.name}</Text>
</Pressable>
</View>
</>
) : (
<View style={[s.card, { alignItems: "center" }]}>
<Glow size={78} w={1} />
<Text style={[s.name, { fontFamily: SERIF, marginTop: 12 }]}>Everyone's warm.</Text>
<Text style={[s.body, { textAlign: "center" }]}>Nobody's drifting right now. Close the app and go live your life.</Text>
</View>
)}

{also.length > 0 && (
<>
<Text style={[s.eyebrow, { marginTop: 36 }]}>STARTING TO COOL</Text>
{also.map((p) => (
<Pressable key={p.id} style={s.row} onPress={() => onOpenPerson(p)}>
<Glow size={44} w={warmth(p.daysSince, p.cadence)} flame={false} />
<View style={{ flex: 1 }}>
<Text style={s.rowName}>{p.name}</Text>
<Text style={s.meta}>{p.daysSince} days · {p.dates[0] ? `${p.dates[0].label} ${p.dates[0].when}` : p.relationship}</Text>
</View>
<Text style={{ color: C.coralDeep, fontSize: 13 }}>Reach out</Text>
</Pressable>
))}
</>
)}

<View style={s.note}>
<Text style={{ color: C.ink, fontSize: 13 }}>
<Text style={{ fontWeight: "700" }}>{reachedToday} real {reachedToday === 1 ? "conversation" : "conversations"}</Text> started today. The only number that counts here.
</Text>
</View>

<Text style={s.poweredBy}>Powered by Whetstone</Text>
</ScrollView>
);
}

const s = StyleSheet.create({
brand: { fontSize: 19, color: C.ink },
greet: { fontSize: 14, color: C.inkSoft, marginTop: 2, marginBottom: 28 },
eyebrow: { fontSize: 11, letterSpacing: 2, color: C.inkFaint, fontWeight: "600", marginBottom: 12 },
card: { backgroundColor: C.paper, borderRadius: 26, padding: 22, borderWidth: 1, borderColor: C.border },
name: { fontSize: 24, color: C.ink },
meta: { fontSize: 12, color: C.inkFaint, marginTop: 2 },
body: { fontSize: 15, lineHeight: 22, color: C.ink, marginTop: 12 },
know: { fontSize: 13, lineHeight: 20, color: C.inkSoft, marginTop: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: C.gold },
primary: { backgroundColor: C.coral, borderRadius: 999, paddingVertical: 14, alignItems: "center", marginTop: 18 },
primaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
secondaryLink: { color: C.inkSoft, fontSize: 13, textAlign: "center", marginTop: 10 },
row: { backgroundColor: C.paper, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: C.borderSoft, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
rowName: { fontSize: 15, fontWeight: "600", color: C.ink },
note: { backgroundColor: "rgba(138,163,149,0.12)", borderRadius: 18, padding: 16, marginTop: 36 },
poweredBy: { color: '#8E8E93', fontSize: 11, textAlign: 'center', marginTop: 24 },
});
