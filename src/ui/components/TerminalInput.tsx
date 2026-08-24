import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { COLORS, FONT } from "../theme";

type Props = TextInputProps;

/** Monospace, terminal-styled text input — used anywhere the user types free text. */
export function TerminalInput({ style, ...rest }: Props) {
  return (
    <TextInput
      placeholderTextColor={COLORS.muted}
      selectionColor={COLORS.accent}
      style={[styles.input, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    color: COLORS.textBright,
    backgroundColor: COLORS.dim,
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
