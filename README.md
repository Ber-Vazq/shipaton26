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
├── state/SessionContext.tsx # React context wiring engine + storage to screens
├── revenuecat/premiumGate.ts # RC init, hasPremium(), purchase()
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

## Bundle IDs

Locked in `app.json`:

- iOS `bundleIdentifier`: `com.bervazq.adhdreset`
- Android `package`: `com.bervazq.adhdreset`

Do not change these after creating the RevenueCat project or App Store
Connect / Play Console listings — in-app purchase products are tied to the
bundle ID permanently.

## RevenueCat setup (required before a real build)

1. Create a RevenueCat project called `adhd-reset-board`.
2. Add one iOS app (bundle ID `com.bervazq.adhdreset`) and one Android app
   (package `com.bervazq.adhdreset`).
3. Create one entitlement: `premium_reset`.
4. Create one subscription product per store (e.g. `reset_premium_monthly`
   at $2.99/mo) and attach both to the `premium_reset` entitlement under one
   Offering with a `monthly` package.
5. Set the API keys as env vars (see `.env.example` — copy to `.env.local`
   or configure in EAS secrets) instead of hardcoding them in
   `src/revenuecat/premiumGate.ts`:
   - `EXPO_PUBLIC_RC_APPLE_KEY`
   - `EXPO_PUBLIC_RC_GOOGLE_KEY`

The code fails open: if RevenueCat is unreachable, `hasPremium()` returns
`false` instead of crashing/blocking the app.

## Fonts

JetBrains Mono (OFL-licensed) is bundled in `assets/fonts/` and loaded in
`src/app/_layout.tsx` as `JetBrainsMono` (regular) and `JetBrainsMonoBold`
(bold, used for headings/timer digits).

## Premium ritual audio (not yet wired)

`src/app/ritual.tsx` has a comment marking where to wire premium sound
effects with `expo-audio`'s `useAudioPlayer()` once `.mp3` assets are added
to `assets/audio/`. Left unwired intentionally so an empty asset folder
doesn't break the Metro bundle.

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
- Create `reset_premium_monthly` subscription in Play Console → Monetize
- Complete Data Safety form (declare RevenueCat purchase data)
- Add yourself as license tester, verify sandbox purchase, promote to
  Production

**App Store**
- New app in App Store Connect with bundle ID `com.bervazq.adhdreset`
- Create the subscription product in App Store Connect → Subscriptions
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
