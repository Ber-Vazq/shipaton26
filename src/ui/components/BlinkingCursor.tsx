import { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { COLORS, FONT, TERMINAL } from "../theme";

type Props = {
  size?: number;
};

/** A blinking terminal cursor ("_") using Reanimated, for idle/waiting states. */
export function BlinkingCursor({ size = FONT.size.md }: Props) {
  const opacity = useSharedValue(1);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text
      style={[
        style,
        { color: COLORS.accent, fontFamily: FONT.mono, fontSize: size },
      ]}
    >
      {TERMINAL.cursor}
    </Animated.Text>
  );
}
