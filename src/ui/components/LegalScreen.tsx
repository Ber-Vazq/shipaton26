import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../theme";
import { TerminalText } from "./TerminalText";
import type { LegalSection } from "../../legal/content";

type Props = {
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
};

/** Shared renderer for the in-app Privacy Policy and Terms of Service screens. */
export function LegalScreen({ title, effectiveDate, sections }: Props) {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <TerminalText variant="muted">{"< back"}</TerminalText>
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <TerminalText variant="heading" style={styles.title}>
          {title}
        </TerminalText>
        <TerminalText variant="muted" style={styles.effective}>
          ADHD Reset Board · Effective {effectiveDate}
        </TerminalText>

        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <TerminalText variant="accent" style={styles.heading}>
              {section.heading}
            </TerminalText>
            {section.body.map((paragraph, i) => (
              <TerminalText key={i} variant="body" style={styles.paragraph}>
                {paragraph}
              </TerminalText>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
    paddingTop: 60,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 60,
  },
  title: {
    marginBottom: 4,
  },
  effective: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
    gap: 6,
  },
  heading: {},
  paragraph: {
    lineHeight: 20,
  },
});
