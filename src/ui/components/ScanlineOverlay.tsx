import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Canvas, Line, vec } from "@shopify/react-native-skia";

/**
 * Fully transparent CRT scanline effect — horizontal lines every 4px at 6%
 * black opacity. pointerEvents="none" means it never intercepts touches.
 * Mount once in the root layout, wrapping the <Stack>, so every screen
 * inherits it automatically.
 */
export function ScanlineOverlay() {
  const { height, width } = useWindowDimensions();
  const lineCount = Math.max(0, Math.floor(height / 4));
  const lines = Array.from({ length: lineCount });

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
