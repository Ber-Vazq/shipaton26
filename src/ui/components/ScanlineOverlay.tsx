import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { Canvas, Line, vec } from "@shopify/react-native-skia";

/**
 * Fully transparent CRT scanline effect — horizontal lines every 4px at 6%
 * black opacity. pointerEvents="none" means it never intercepts touches.
 * Mount once in the root layout, wrapping the <Stack>, so every screen
 * inherits it automatically.
 *
 * Web uses plain <View> lines instead of Skia's <Canvas>: react-native-skia
 * on web needs the CanvasKit WASM binary loaded and registered separately
 * (see https://shopify.github.io/react-native-skia/docs/getting-started/web),
 * which Expo's default web export doesn't set up. Without it, every Canvas
 * throws "CanvasKit is not defined" / "Cannot read properties of undefined
 * (reading 'PictureRecorder')" on every animation frame — that per-frame
 * crash was stalling other state updates on web too (e.g. the reset timer
 * appearing to never finish). Native (iOS/Android) still uses the real
 * Skia canvas, which doesn't need any of this.
 */
export function ScanlineOverlay() {
  const { height, width } = useWindowDimensions();
  const lineCount = Math.max(0, Math.floor(height / 4));
  const lines = Array.from({ length: lineCount });

  if (Platform.OS === "web") {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {lines.map((_, i) => (
          <View
            key={i}
            style={[styles.webLine, { top: i * 4, width }]}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={{ flex: 1 }}>
        {lines.map((_, i) => (
          <Line
            key={i}
            p1={vec(0, i * 4)}
            p2={vec(width, i * 4)}
            color="rgba(0,0,0,0.06)"
            strokeWidth={1}
          />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  webLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
});
