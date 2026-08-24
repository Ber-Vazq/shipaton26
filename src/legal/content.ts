/**
 * Shared legal copy, rendered both in-app (src/app/privacy.tsx,
 * src/app/terms.tsx) and on the hosted pages at legal.adhdresetboard
 * (adhd-reset-legal.vercel.app), which is what's linked from the RevenueCat
 * paywall footer. Keep both copies in sync when either changes.
 */

export const LEGAL_EFFECTIVE_DATE = "August 24, 2026";
export const SUPPORT_EMAIL = "bernydeplata@gmail.com";
export const PRIVACY_POLICY_URL = "https://adhd-reset-legal.vercel.app/privacy.html";
export const TERMS_OF_SERVICE_URL = "https://adhd-reset-legal.vercel.app/terms.html";

export type LegalSection = { heading: string; body: string[] };

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    heading: "1. Information we do not collect",
    body: [
      "The App does not require an account, login, or profile. There is no in-app messaging, social features, or advertising. We do not use third-party analytics or advertising SDKs.",
    ],
  },
  {
    heading: "2. Information stored on your device",
    body: [
      "Your tasks, steps, reset sessions, and momentum progress are stored locally on your device only, using standard device storage (AsyncStorage). This data is never transmitted to us or to any server we control. If you delete the App, this data is deleted with it.",
    ],
  },
  {
    heading: "3. Purchases and subscriptions",
    body: [
      "Subscription and purchase processing is handled by Apple (App Store) or Google (Google Play), and by our subscription infrastructure provider, RevenueCat, Inc. When you make a purchase, RevenueCat receives an anonymous app user identifier, your purchase/transaction receipt, and entitlement status, in order to verify your subscription and unlock premium features. RevenueCat does not receive your name, email, or payment details from us \u2014 those are handled directly by Apple or Google. See RevenueCat's Privacy Policy (revenuecat.com/privacy) for details.",
    ],
  },
  {
    heading: "4. Data we do not sell or share",
    body: [
      "We do not sell, rent, or share your data with third parties for advertising or marketing purposes. We do not have access to a database of App users' personal task content \u2014 it never leaves your device.",
    ],
  },
  {
    heading: "5. Children's privacy",
    body: [
      "The App is not directed to children under 13, and we do not knowingly collect personal information from children under 13.",
    ],
  },
  {
    heading: "6. Your choices",
    body: [
      "Because task data lives only on your device, you control it directly: delete individual tasks in-app, or delete the App to remove all locally stored data. To manage or cancel a subscription, use your Apple ID or Google Play account subscription settings, or the in-app Manage Subscription option.",
    ],
  },
  {
    heading: "7. Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time. Material changes will be reflected by an updated Effective date at the top of this page.",
    ],
  },
  {
    heading: "8. Contact us",
    body: [`Questions about this Privacy Policy? Email ${SUPPORT_EMAIL}.`],
  },
];

export const TERMS_OF_SERVICE_SECTIONS: LegalSection[] = [
  {
    heading: "1. License to use the App",
    body: [
      "We grant you a limited, non-exclusive, non-transferable, revocable license to use the App on devices you own or control, for your personal, non-commercial use, subject to these Terms and the App Store or Google Play terms under which you downloaded it.",
    ],
  },
  {
    heading: "2. Subscriptions and purchases",
    body: [
      "The App offers optional premium features via subscription (monthly or annual, auto-renewing) or a one-time lifetime purchase, processed through the App Store or Google Play and managed with RevenueCat.",
      "Monthly and annual subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. Your Apple ID or Google account will be charged for renewal within 24 hours prior to the end of the current period, at the price you agreed to at purchase. Manage or cancel anytime in your Apple ID or Google Play account settings, or via the in-app Manage Subscription option. The lifetime purchase is a one-time, non-renewing purchase that unlocks premium features permanently. Refunds are handled by Apple or Google according to their respective refund policies.",
    ],
  },
  {
    heading: "3. Your content",
    body: [
      "Tasks, steps, and session data you create in the App are stored only on your device. You are responsible for backing up this data; we do not maintain a copy and cannot recover it if it is lost.",
    ],
  },
  {
    heading: "4. Acceptable use",
    body: [
      "You agree not to reverse engineer, decompile, or attempt to extract the source code of the App, except where permitted by law, and not to use the App for any unlawful purpose.",
    ],
  },
  {
    heading: "5. Disclaimer of warranties",
    body: [
      "The App is not a medical device and does not provide medical, clinical, or therapeutic advice. It is a productivity tool and is provided \"as is\" and \"as available,\" without warranties of any kind, express or implied.",
    ],
  },
  {
    heading: "6. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the App.",
    ],
  },
  {
    heading: "7. Changes to these Terms",
    body: ["We may update these Terms from time to time. Continued use of the App after a change means you accept the updated Terms."],
  },
  {
    heading: "8. Termination",
    body: ["We may suspend or terminate your access to the App if you violate these Terms. You may stop using the App at any time by deleting it."],
  },
  {
    heading: "9. Governing law",
    body: ["These Terms are governed by the laws of the State of Texas, USA, without regard to conflict-of-law principles."],
  },
  {
    heading: "10. Contact us",
    body: [`Questions about these Terms? Email ${SUPPORT_EMAIL}.`],
  },
];
