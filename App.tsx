import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, TextInput, Linking, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { C, SERIF } from "./src/theme";
import { Person } from "./src/data/types";
import { initDB, getAllPeople, markReachedDB, applyCapture } from "./src/data/db";
import { draftOpener } from "./src/services/ai";
import { parseCapture } from "./src/services/capture";
import TodayScreen from "./src/screens/TodayScreen";
import CircleScreen from "./src/screens/CircleScreen";
import PersonScreen from "./src/screens/PersonScreen";

type Tab = "today" | "circle";
type Compose = { person: Person; text: string; loading: boolean } | null;

export default function App() {
  const [fontsLoaded] = useFonts({ Fraunces_600SemiBold });
  const [people, setPeople] = useState<Person[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [openPerson, setOpenPerson] = useState<Person | null>(null);
  const [compose, setCompose] = useState<Compose>(null);
  const [reachedToday, setReachedToday] = useState(0);

  // First open: run the migration + seed, then hydrate from the local DB.
  useEffect(() => {
    (async () => {
      await initDB();
      setPeople(await getAllPeople());
      setDbReady(true);
    })();
  }, []);

  // Re-read the whole circle from the DB after any write — single source of truth.
  async function refresh(focusId?: string) {
    const all = await getAllPeople();
    setPeople(all);
    if (focusId) {
      const updated = all.find((x) => x.id === focusId);
      if (updated) setOpenPerson(updated);
    }
  }

  async function reachOut(p: Person) {
    setCompose({ person: p, text: "", loading: true });
    const text = await draftOpener(p);
    setCompose((c) => (c && c.person.id === p.id ? { ...c, text, loading: false } : c));
  }

  async function sendAndMark(p: Person, text: string) {
    Linking.openURL(`sms:&body=${encodeURIComponent(text)}`).catch(() => {});
    setCompose(null);
    setReachedToday((n) => n + 1);
    await markReachedDB(p.id);
    await refresh(openPerson?.id === p.id ? p.id : undefined);
  }

  async function markTalked(p: Person) {
    setReachedToday((n) => n + 1);
    await markReachedDB(p.id);
    await refresh(p.id);
  }

  // Frictionless capture: AI digests the raw note, we persist the structured
  // result, then re-sync so the open person reflects what Ember now knows.
  async function capture(p: Person, note: string) {
    const result = await parseCapture(p, note);
    await applyCapture(p.id, result);
    await refresh(p.id);
  }

  // Hold on a bare linen screen until Fraunces resolves and the local DB has
  // hydrated, so the brand serif never flashes in a fallback face and the
  // circle never renders empty.
  if (!fontsLoaded || !dbReady) {
    return <View style={{ flex: 1, backgroundColor: C.linen }} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.linen }}>
        {openPerson ? (
          <PersonScreen person={openPerson} onBack={() => setOpenPerson(null)} onReachOut={reachOut} onMarkTalked={markTalked} onCapture={capture} />
        ) : tab === "today" ? (
          <TodayScreen people={people} reachedToday={reachedToday} onReachOut={reachOut} onOpenPerson={setOpenPerson} />
        ) : (
          <CircleScreen people={people} onOpenPerson={setOpenPerson} />
        )}

        {!openPerson && (
          <View style={s.nav}>
            {(["today", "circle"] as Tab[]).map((t) => (
              <Pressable key={t} style={s.navBtn} onPress={() => setTab(t)}>
                <Text style={[s.navText, { color: tab === t ? C.coralDeep : C.inkFaint, fontWeight: tab === t ? "700" : "500" }]}>
                  {t === "today" ? "Today" : "Circle"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Modal visible={!!compose} transparent animationType="slide" onRequestClose={() => setCompose(null)}>
          <Pressable style={s.backdrop} onPress={() => setCompose(null)}>
            <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
              {compose && (
                <>
                  <Text style={[s.sheetTitle, { fontFamily: SERIF }]}>Reach out to {compose.person.name}</Text>
                  <Text style={s.sheetSub}>Drafted in your voice — edit it, make it yours.</Text>
                  <View style={s.draftBox}>
                    {compose.loading ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <ActivityIndicator color={C.coral} />
                        <Text style={{ color: C.inkFaint }}>Thinking about what {compose.person.name} needs to hear…</Text>
                      </View>
                    ) : (
                      <TextInput multiline value={compose.text} onChangeText={(t) => setCompose({ ...compose, text: t })} style={s.input} />
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                    <Pressable style={s.tryBtn} disabled={compose.loading} onPress={() => reachOut(compose.person)}>
                      <Text style={{ color: C.ink, fontWeight: "600" }}>Try another</Text>
                    </Pressable>
                    <Pressable style={s.sendBtn} disabled={compose.loading} onPress={() => sendAndMark(compose.person, compose.text)}>
                      <Text style={{ color: "#fff", fontWeight: "600" }}>Open Messages</Text>
                    </Pressable>
                  </View>
                  <Text style={s.handoff}>Ember hands you off to a real conversation. It doesn't want to be the one you talk to.</Text>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: "row", backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.border },
  navBtn: { flex: 1, paddingVertical: 16, alignItems: "center" },
  navText: { fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: "rgba(42,34,48,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: C.linen, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 24, paddingBottom: 36 },
  sheetTitle: { fontSize: 20, color: C.ink },
  sheetSub: { fontSize: 13, color: C.inkSoft, marginTop: 2, marginBottom: 14 },
  draftBox: { backgroundColor: C.paper, borderRadius: 18, padding: 16, minHeight: 120, borderWidth: 1, borderColor: C.border, justifyContent: "center" },
  input: { fontSize: 15, lineHeight: 22, color: C.ink, minHeight: 100, textAlignVertical: "top" },
  tryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 999, backgroundColor: C.paper, borderWidth: 1, borderColor: C.border },
  sendBtn: { flex: 1, paddingVertical: 14, borderRadius: 999, backgroundColor: C.coral, alignItems: "center" },
  handoff: { textAlign: "center", fontSize: 11, color: C.inkFaint, marginTop: 12 },
});
