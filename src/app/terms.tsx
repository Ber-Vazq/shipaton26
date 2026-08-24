import { LegalScreen } from "../ui/components/LegalScreen";
import { LEGAL_EFFECTIVE_DATE, TERMS_OF_SERVICE_SECTIONS } from "../legal/content";

export default function TermsOfServiceScreen() {
  return (
    <LegalScreen
      title="terms_of_service"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      sections={TERMS_OF_SERVICE_SECTIONS}
    />
  );
}
