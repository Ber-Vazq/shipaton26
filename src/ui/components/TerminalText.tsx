import { Text, type TextProps, type TextStyle } from "react-native";
import { COLORS, FONT } from "../theme";

type Variant = "body" | "bright" | "muted" | "accent" | "heading" | "timer";

const VARIANT_STYLE: Record<Variant, TextStyle> = {
  body: { color: COLORS.text, fontSize: FONT.size.md },
  bright: { color: COLORS.textBright, fontSize: FONT.size.md },
  muted: { color: COLORS.muted, fontSize: FONT.size.sm },
  accent: { color: COLORS.accent, fontSize: FONT.size.md },
  heading: { color: COLORS.accent, fontSize: FONT.size.xl },
  timer: { color: COLORS.accent, fontSize: FONT.size.timer },
};

const BOLD_VARIANTS: Variant[] = ["heading", "timer"];

type Props = TextProps & { variant?: Variant };

/** Monospace terminal-styled text. Every string in the app should render through this. */
export function TerminalText({ variant = "body", style, ...rest }: Props) {
  const fontFamily = BOLD_VARIANTS.includes(variant) ? FONT.monoBold : FONT.mono;
  return (
    <Text
      {...rest}
      style={[{ fontFamily }, VARIANT_STYLE[variant], style]}
    />
  );
}
