import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { C, SERIF } from "../theme";
import { Person } from "../data/types";
import { warmth, warmthLabel, byUrgency } from "../data/store";
import Glow from "../components/Glow";

export default function CircleScreen({ people, onOpenPerson }: { people: Person[]; onOpenPerson: (p: Person) => void }) {
  const ordered = byUrgency(people);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.linen }} contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 40 }}>
      <Text style={[s.title, { fontFamily: SERIF }]}>Your circle</Text>
      <Text style={s.sub}>{people.length} people you don't want to lose. Keep it small.</Text>
      <View style={s.grid}>
        {ordered.map((p) => {
          const w = warmth(p.daysSince, p.cadence);
          return (
            <Pressable key={p.id} style={s.tile} onPress={() => onOpenPerson(p)}>
              <Glow size={70} w={w} />
              <Text style={[s.name, { fontFamily: SERIF }]}>{p.name}</Text>
              <Text style={s.meta}>{warmthLabel(w)} · {p.daysSince}d</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 30, color: C.ink },
  sub: { fontSize: 14, color: C.inkSoft, marginTop: 2, marginBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47%", backgroundColor: C.paper, borderRadius: 26, padding: 18, borderWidth: 1, borderColor: C.border, alignItems: "center" },
  name: { fontSize: 18, color: C.ink, marginTop: 8 },
  meta: { fontSize: 11, color: C.inkFaint, marginTop: 2 },
});
