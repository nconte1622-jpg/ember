import React from "react";
import { View } from "react-native";
import { C } from "../theme";

function glowColor(w: number): string {
  if (w > 0.66) return C.gold;
  if (w > 0.33) return C.coral;
  return C.inkFaint;
}

export default function Glow({ size, w, flame = true }: { size: number; w: number; flame?: boolean }) {
  const col = glowColor(w);
  const haloOpacity = 0.18 + w * 0.5;
  // RN has no radial gradient natively; fake the halo with stacked translucent rings.
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: col, opacity: haloOpacity * 0.25 }} />
      <View style={{ position: "absolute", width: size * 0.78, height: size * 0.78, borderRadius: size, backgroundColor: col, opacity: haloOpacity * 0.4 }} />
      <View
        style={{
          width: size * 0.5, height: size * 0.5, borderRadius: size,
          backgroundColor: C.paper, borderWidth: 1.5, borderColor: col,
          alignItems: "center", justifyContent: "center",
          shadowColor: col, shadowOpacity: w * 0.6, shadowRadius: size * 0.2, shadowOffset: { width: 0, height: 0 },
        }}
      >
        {flame && (
          <View style={{ width: size * 0.16, height: size * 0.22, borderRadius: size * 0.1, backgroundColor: col }} />
        )}
      </View>
    </View>
  );
}
