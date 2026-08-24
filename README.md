# ADHD Reset Board

A terminal/CRT-styled app that removes the "which do I start" decision: pick
one queued task at random, work through its tiny steps, run a 2–10 minute
timer, then hit a reset ritual screen. Momentum only ever goes up — there's
no shame mechanic for a missed session.

Built for Shipaton 2026 on Expo SDK 57 / React Native 0.86.2 / React 19 with
Expo Router file-based routing.

## Get started

```bash
npm install
npx expo start
```

Open in a [development build](https://docs.expo.dev/develop/development-builds/introduction/),
an Android emulator, iOS simulator, or [Expo Go](https://expo.dev/go).

## Project layout

All application code lives in `src/`, only screens/layout files live in
`src/app/` (Expo Router's file-based routing root):

```
src/
├── app/                 # Expo Router screens
│   ├── index.tsx        # Home: open-task feed + random picker
│   ├── steps/[id].tsx   # Step breakdown for a task
│   ├── timer/[id].tsx   # 2–10 min countdown screen
│   ├── ritual.tsx       # Reset ritual completion screen
│   ├── paywall.tsx      # RevenueCat premium screen
│   └── _layout.tsx      # Root layout: font load, RC init, scanline overlay
├── model/types.ts        # Task, Step, ResetSession — all TS types
├── engine/resetLoop.ts   # Pure logic: random picker, timer tick, momentum
├── storage/store.ts      # AsyncStorage read/write wrappers
├── state/SessionContext.tsx  # React context wiring engine + storage to screens
├── state/PurchasesContext.tsx # Reactive CustomerInfo/isPro state, app-wide
├── revenuecat/
│   ├── premiumGate.ts    # RC init, getCustomerInfo(), purchasePackage(),
│   │                     # restorePurchases(), offering/package accessors
│   └── paywallUI.ts      # presentPaywall(), presentPaywallIfNeeded(),
│                          # presentCustomerCenter() (react-native-purchases-ui)
└── ui/
    ├── theme.ts          # Color palette, font name constants
    └── components/       # TerminalText, AsciiCheckbox, HashProgressBar,
                           # BlinkingCursor, ScanlineOverlay
```

`src/engine/` and `src/model/` are pure TypeScript with zero React Native
imports — they can be unit tested with plain jest. Keep that boundary strict.

The original Expo starter scaffold was moved to `example/` by
`npm run reset-project` for reference and can be deleted once you're no
longer using it as a comparison.

## Fonts

JetBrains Mono (OFL-licensed) is bundled in `assets/fonts/` and loaded in
`src/app/_layout.tsx` as `JetBrainsMono` (regular) and `JetBrainsMonoBold`
(bold, used for headings/timer digits).

## Premium ritual audio (not yet wired)

`src/app/ritual.tsx` has a comment marking where to wire premium sound
effects with `expo-audio`'s `useAudioPlayer()` once `.mp3` assets are added
to `assets/audio/`. Left unwired intentionally so an empty asset folder
doesn't break the Metro bundle.

## Subscriptions (RevenueCat)

This app gates premium features behind the RevenueCat entitlement
`adhd_reset_board_pro`, sold as three packages in one Offering:

| Package  | RevenueCat identifier | Store product type                          |
|----------|------------------------|----------------------------------------------|
| Monthly  | `$rc_monthly`          | Auto-renewing subscription                    |
| Annual   | `$rc_annual`           | Auto-renewing subscription (same group as monthly on iOS) |
| Lifetime | `$rc_lifetime`         | Non-consumable in-app purchase                |

Using RevenueCat's reserved package identifiers means the code in
`src/revenuecat/premiumGate.ts` (`offering.monthly` / `.annual` / `.lifetime`)
keeps working no matter what you name the underlying store products.

**Setup**
1. Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_RC_APPLE_KEY` /
   `EXPO_PUBLIC_RC_GOOGLE_KEY` to your RevenueCat public API keys (falls back
   to a shared test key for local development if unset).
2. In the RevenueCat dashboard: create the `adhd_reset_board_pro`
   entitlement, attach the three packages above to one Offering, mark it
   "current", and design a Paywall for it under **Paywalls**.
3. `Purchases.configure()` runs once at app start in `src/app/_layout.tsx`.
   `src/state/PurchasesContext.tsx` (`usePurchases()`) keeps `customerInfo`
   and `isPro` reactive app-wide via `addCustomerInfoUpdateListener`.
4. `src/app/paywall.tsx` calls `presentPaywall()` (RevenueCat-hosted paywall
   UI) to sell, and `presentCustomerCenter()` to let existing subscribers
   manage/cancel/restore — no custom subscription-management UI needed.
5. Custom fonts (e.g. JetBrains Mono) in the Paywall Editor: upload every
   weight you plan to use via the font-family gear icon on a text component
   — the editor only offers weights you've actually uploaded for that
   family, so a "not in custom font family" error usually means a weight
   (e.g. Bold) is selected but wasn't uploaded yet.
6. Privacy Policy / Terms of Service links (required by the Paywall
   Editor and recommended for app review): set the footer link fields to
   `https://adhd-reset-legal.vercel.app/privacy.html` and
   `https://adhd-reset-legal.vercel.app/terms.html`. The same copy is also
   rendered in-app at `src/app/privacy.tsx` / `src/app/terms.tsx` (source
   of truth in `src/legal/content.ts`), linked from the home screen and
   paywall footers, so it's reachable even without network access.

## EAS builds

```bash
npx eas build:configure   # only if eas.json needs regenerating
npx eas login
npx eas build --platform android --profile production   # → .aab
npx eas build --platform ios --profile production       # → .ipa
```

EAS handles code signing automatically on first run and will prompt for
Apple Developer / Google Play credentials.

## Store submission checklist

**Google Play**
- New app in Play Console (brand-new listing, not an update)
- Upload `.aab` to Internal Testing track first
- Create the monthly + annual subscriptions in Play Console → Monetize →
  Subscriptions, and the lifetime product under Monetize → Products →
  In-app products (non-consumable, NOT a subscription)
- Complete Data Safety form (declare RevenueCat purchase data)
- Add yourself as license tester, verify sandbox purchase, promote to
  Production

**App Store**
- New app in App Store Connect with bundle ID `com.bervazq.adhdreset`
- Create monthly + annual in the same Subscription Group in App Store
  Connect → Subscriptions, and lifetime as a separate non-consumable IAP
- Upload `.ipa` via `eas submit --platform ios` or Transporter
- Add a sandbox tester, complete the App Privacy questionnaire, submit

**Shipaton-specific**
- Both listings must be brand-new (not updates to existing apps)
- RevenueCat SDK must power a real live in-app purchase in the submitted
  build — not a stub
- Record a demo video: first open → no login → pick/randomize task → steps
  → timer → ritual → paywall → subscribe

## Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow the guide on
  ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- For unit testing, follow the guide on
  ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
