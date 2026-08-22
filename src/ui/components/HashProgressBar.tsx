import { StyleSheet, View } from "react-native";
import { COLORS, FONT } from "../theme";
import { TerminalText } from "./TerminalText";

type Props = {
  /** 0..1 */
  progress: number;
  width?: number;
};

/** ASCII-style progress bar rendered with # (filled) and - (empty) characters. */
export function HashProgressBar({ progress, width = 24 }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const filled = Math.round(clamped * width);
  const bar = "#".repeat(filled) + "-".repeat(width - filled);

  return (
    <View style={styles.wrap}>
      <TerminalText style={styles.bar}>[{bar}]</TerminalText>
      <TerminalText variant="muted">{Math.round(clamped * 100)}%</TerminalText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bar: {
    color: COLORS.accent,
    fontSize: FONT.size.sm,
    letterSpacing: 0,
  },
});
