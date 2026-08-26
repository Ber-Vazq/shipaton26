import { Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { COLORS, TERMINAL } from "../theme";
import { TerminalText } from "./TerminalText";

type Props = {
  label: string;
  done: boolean;
  onToggle: () => void;
};

/** Renders a step as [x]/[ ] ASCII checkbox instead of a native toggle widget. */
export function AsciiCheckbox({ label, done, onToggle }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.row}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
    >
      <View style={styles.checkboxWrap}>
        <TerminalText variant={done ? "accent" : "body"}>
          {TERMINAL.checkbox(done)}
        </TerminalText>
      </View>
      <TerminalText
        variant={done ? "muted" : "body"}
        style={done ? styles.strike : undefined}
      >
        {label}
      </TerminalText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dim,
  },
  checkboxWrap: {
    minWidth: 32,
  },
  strike: {
    textDecorationLine: "line-through",
  },
});
