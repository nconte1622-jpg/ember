import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { C, SERIF } from "../theme";
import { Person } from "../data/types";
import { warmth } from "../data/store";
import Glow from "../components/Glow";

type Props = {
  person: Person;
  onBack: () => void;
  onReachOut: (p: Person) => void;
  onMarkTalked: (p: Person) => void;
  onCapture?: (p: Person, note: string) => Promise<void>;
};

type CaptureStatus = "idle" | "saving" | "done";

export default function PersonScreen({ person, onBack, onReachOut, onMarkTalked, onCapture }: Props) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  async function submitNote() {
    const text = note.trim();
    if (!text || status === "saving" || !onCapture) return;
    setStatus("saving");
    try {
      await onCapture(person, text);
      if (!mounted.current) return;
      setNote("");
      setStatus("done");
      setTimeout(() => mounted.current && setStatus("idle"), 2400);
    } catch {
      if (mounted.current) setStatus("idle");
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.linen }} contentContainerStyle={{ paddingBottom: 48 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 56 }}>
        <Pressable onPress={onBack}><Text style={s.back}>‹ Back</Text></Pressable>
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Glow size={118} w={warmth(person.daysSince, person.cadence)} />
          <Text style={[s.name, { fontFamily: SERIF }]}>{person.name}</Text>
          <Text style={s.meta}>{person.relationship} · {person.daysSince} days since you connected</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 24, gap: 14 }}>
        <Block label="WHAT'S GOING ON WITH THEM" text={person.goingOn} />
        <Block label="WORTH REMEMBERING" text={person.worthKnowing} />

        {person.dates.length > 0 && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {person.dates.map((d, i) => (
              <View key={i} style={s.date}>
                <Text style={{ fontSize: 11, color: C.inkSoft }}>{d.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: C.ink }}>{d.when}</Text>
              </View>
            ))}
          </View>
        )}

        <View>
          <Text style={s.eyebrow}>BETWEEN YOU</Text>
          {person.history.map((h, i) => (
            <Text key={i} style={s.hist}>· {h}</Text>
          ))}
        </View>

        {onCapture && (
          <View>
            <Text style={s.eyebrow}>JUST TALKED?</Text>
            {status === "saving" ? (
              <View style={[s.captureBar, s.captureBusy]}>
                <ActivityIndicator color={C.coral} />
                <Text style={s.captureBusyText}>Ember is updating what it knows…</Text>
              </View>
            ) : status === "done" ? (
              <View style={[s.captureBar, s.captureDone]}>
                <Text style={{ color: C.sage, fontSize: 16 }}>✓</Text>
                <Text style={s.captureDoneText}>Got it. Ember remembered.</Text>
              </View>
            ) : (
              <View style={s.captureBar}>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Quick note after talking…"
                  placeholderTextColor={C.inkFaint}
                  style={s.captureInput}
                  returnKeyType="send"
                  onSubmitEditing={submitNote}
                  blurOnSubmit={false}
                />
                <Pressable
                  style={[s.sendDot, { opacity: note.trim() ? 1 : 0.4 }]}
                  onPress={submitNote}
                  disabled={!note.trim()}
                >
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>→</Text>
                </Pressable>
              </View>
            )}
            <Text style={s.captureHint}>A few words is enough — Ember does the remembering.</Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 24, marginTop: 24 }}>
        <Pressable style={s.primary} onPress={() => onReachOut(person)}>
          <Text style={s.primaryText}>Help me reach out</Text>
        </Pressable>
        <Pressable style={s.check} onPress={() => onMarkTalked(person)}>
          <Text style={{ color: C.ink, fontSize: 16 }}>✓</Text>
        </Pressable>
      </View>
      <Text style={s.tip}>Tap ✓ when you've talked — takes a second, and Ember remembers the rest.</Text>
    </ScrollView>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <View style={s.block}>
      <Text style={s.eyebrow}>{label}</Text>
      <Text style={s.blockText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  back: { color: C.inkSoft, fontSize: 16, marginBottom: 18 },
  name: { fontSize: 30, color: C.ink, marginTop: 10 },
  meta: { fontSize: 13, color: C.inkFaint, marginTop: 2, textAlign: "center" },
  block: { backgroundColor: C.paper, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.border },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, color: C.inkFaint, fontWeight: "600", marginBottom: 8 },
  blockText: { fontSize: 15, lineHeight: 22, color: C.ink },
  date: { flex: 1, backgroundColor: "rgba(232,165,60,0.12)", borderRadius: 18, padding: 14 },
  hist: { fontSize: 13, lineHeight: 21, color: C.inkSoft, marginBottom: 4 },
  captureBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.paper, borderRadius: 999, borderWidth: 1, borderColor: C.border, paddingLeft: 18, paddingRight: 6, paddingVertical: 6, minHeight: 52 },
  captureInput: { flex: 1, fontSize: 15, color: C.ink, paddingVertical: 6 },
  sendDot: { width: 40, height: 40, borderRadius: 999, backgroundColor: C.coral, alignItems: "center", justifyContent: "center" },
  captureBusy: { paddingRight: 18 },
  captureBusyText: { color: C.inkSoft, fontSize: 14, flex: 1 },
  captureDone: { paddingRight: 18, borderColor: "rgba(138,163,149,0.5)", backgroundColor: "rgba(138,163,149,0.10)" },
  captureDoneText: { color: C.sage, fontSize: 14, fontWeight: "600" },
  captureHint: { fontSize: 11, color: C.inkFaint, marginTop: 8, paddingLeft: 4 },
  primary: { flex: 1, backgroundColor: C.coral, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  check: { width: 54, backgroundColor: C.paper, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  tip: { textAlign: "center", fontSize: 11, color: C.inkFaint, marginTop: 10, paddingHorizontal: 40 },
});
