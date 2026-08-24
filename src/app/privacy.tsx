import { LegalScreen } from "../ui/components/LegalScreen";
import { LEGAL_EFFECTIVE_DATE, PRIVACY_POLICY_SECTIONS } from "../legal/content";

export default function PrivacyPolicyScreen() {
  return (
    <LegalScreen
      title="privacy_policy"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}
