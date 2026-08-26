# App Store + Google Play Setup Guide

Full path from "code is done" to "live on both stores" for the ADHD Reset
Board app (`com.bervazq.adhdreset`). Written so it can be followed
top-to-bottom, in order — later phases depend on earlier ones.

Sources: [Apple Developer Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/), [Apple membership pricing](https://developer.apple.com/support/compare-memberships/), [Google Play testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en), [Expo EAS Submit for iOS](https://docs.expo.dev/submit/ios/), [RevenueCat: connect a store](https://www.revenuecat.com/docs/projects/connect-a-store), [RevenueCat: Google Play service credentials](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials).

## Phase 0 — Accounts (do these first, in parallel)

| Account | Cost | Notes |
|---|---|---|
| **Apple Developer Program** | $99/year | Individual enrollment usually verifies in 24–48h. Use your real legal name — an alias/nickname delays approval. [Enroll here](https://developer.apple.com/programs/enroll/). |
| **Google Play Console** | $25 one-time | ⚠️ Personal accounts created after Nov 13, 2023 must run a closed test with **12 testers opted in for 14 continuous days** before Google grants production access — this is a hard timeline constraint, start it early. [Register here](https://play.google.com/console/signup). |
| **Expo/EAS account** | Free | `eas-cli` is already installed in this repo (v22.2.0). Just need `eas login`. |
| **RevenueCat account** | Free tier | You already have a project with entitlement `adhd_reset_board_pro` and monthly/annual/lifetime packages (per earlier work). Just need to connect the stores + get production keys. |

**Action right now:** tell me which of these four you already have, and I'll skip straight to what's actually left.

---

## Phase 1 — Link the EAS project

```bash
cd shipaton26
eas login                 # opens browser auth, one time
eas init                  # creates/links an EAS project, writes projectId into app.json's extra.eas
```

This adds an `extra.eas.projectId` block to `app.json` — safe to commit, it's just an identifier, not a secret.

---

## Phase 2 — Store app records

**App Store Connect** ([appstoreconnect.apple.com](https://appstoreconnect.apple.com)):
1. My Apps → + → New App.
2. Bundle ID: register `com.bervazq.adhdreset` under Certificates/Identifiers/Profiles first if it's not already there, then pick it here.
3. SKU: any internal string, e.g. `adhdresetboard1`.
4. Fill Agreements, Tax, and Banking (Business tab) — **this must show "Active" before you can create paid subscription products.**

**Google Play Console** ([play.google.com/console](https://play.google.com/console)):
1. Create app → name, default language, App/Game, Free.
2. Package name: `com.bervazq.adhdreset` (must match `app.json`'s `android.package` exactly, cannot be changed later).
3. Complete the "Set up your app" checklist (App content: privacy policy URL — you already have `https://adhd-reset-legal.vercel.app/privacy` — ads declaration, content rating questionnaire, target audience, Data safety form, government apps declaration).

---

## Phase 3 — Subscription products (must match RevenueCat + your paywall exactly)

Create these in **both** stores with identical/near-identical structure (RevenueCat maps them into one Offering):

- Monthly subscription
- Annual subscription
- Lifetime (non-consumable one-time purchase on iOS; managed product on Android)

App Store Connect: My App → Monetization → Subscriptions → create a Subscription Group, then add products.
Google Play Console: your app → Monetize → Products → Subscriptions → Create subscription.

Keep the product IDs (e.g. `adhdresetboard_monthly`, `adhdresetboard_annual`, `adhdresetboard_lifetime`) in RevenueCat's Product catalog and Offering config too — they must match exactly across all three places.

---

## Phase 4 — Connect RevenueCat to both stores

This is what lets RevenueCat validate real purchases/receipts server-side. This app uses `react-native-purchases` v10.7.2, which runs on RevenueCat's StoreKit 2-era native SDK — that determines which Apple key type you need below (not the legacy one).

**iOS side — two separate Apple key pairs, do not reuse one for the other:**

1. **In-App Purchase Key** (required — this is the one RevenueCat needs for StoreKit 2 receipt validation, per [Apple's docs](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/generate-keys-for-in-app-purchases/)):
   - App Store Connect → Users and Access → Integrations → **In-App Purchase** tab (not "Team Keys") → Generate In-App Purchase Key.
   - Download the `.p8` **immediately — one-time download.** Note its Issuer ID + Key ID.
   - RevenueCat dashboard → Project Settings → your iOS app → paste the Issuer ID, Key ID, and upload this `.p8`.
   - (The legacy "App-Specific Shared Secret" under App Information is only needed for StoreKit 1 — skip it, not applicable here.)
2. **App Store Connect API Key** (a *different* key pair — used later for `eas submit`/CI, and separately, optionally, lets RevenueCat import your product catalog):
   - Same Integrations page → **Team Keys** tab this time → Generate → role **Admin**.
   - This is the one referenced again in Phase 6.

**Android side — Google Play service account:**
1. Google Cloud Console → new/existing project → IAM & Admin → Service Accounts → Create Service Account.
2. Grant it access, create a JSON key, download it.
3. Google Play Console → Setup → API access → link the Cloud project, then grant that service account **Admin** (or at minimum "View financial data" + "Manage orders and subscriptions") permission under Users and Permissions.
4. RevenueCat dashboard → Project Settings → your Android app → upload that JSON key as the Service Account Credentials.

**Once both are connected, get your real production API keys:**
RevenueCat dashboard → Project Settings → API keys → **App specific keys** section → copy the **Apple** public key (`appl_...`) and **Google** public key (`goog_...`) — these replace the shared `test_...` placeholder currently in the code. See "RevenueCat's key types, in full" below for what these actually are and what you don't need.

### RevenueCat's key types, in full

Every key you'll encounter across this whole setup, and whether this app actually needs it:

| Key | Prefix/form | What it's for | Do you need it? |
|---|---|---|---|
| RevenueCat **public SDK key** — iOS | `appl_...` | Configures the Purchases SDK in the app itself | **Yes** — `EXPO_PUBLIC_RC_APPLE_KEY` |
| RevenueCat **public SDK key** — Android | `goog_...` | Same, for Android | **Yes** — `EXPO_PUBLIC_RC_GOOGLE_KEY` |
| RevenueCat **Test Store key** | `test_...` | Sandbox-only, no real store attached | Already in the code as the dev fallback — **never ship a production build configured with this one** |
| RevenueCat **secret API key** | `sk_...` | Server-side only: grant/revoke entitlements, delete subscribers, RevenueCat's REST API v2 | **No** — you have no backend that calls RevenueCat's API. Never put this in the app; the SDK will actually refuse to initialize with it |
| Apple **In-App Purchase Key** | Issuer ID + Key ID + `.p8` | Lets RevenueCat validate StoreKit 2 receipts | **Yes**, entered directly into the RevenueCat dashboard (Phase 4) |
| Apple **App Store Connect (Team) API Key** | Issuer ID + Key ID + `.p8`, different pair | Lets `eas submit` upload builds/manage TestFlight non-interactively; optionally lets RevenueCat import your product catalog | **Yes**, for EAS submit (Phase 6) |
| Google Play **service account JSON** | JSON file | Lets RevenueCat validate Play Billing purchases, and lets `eas submit` upload `.aab`s | **Yes** — one JSON file, reused for both purposes |

So concretely: you'll only ever put the two `appl_.../goog_...` **public** keys into this app's code (via env vars). Everything else — the In-App Purchase key, the Team API key, the Google service account JSON — gets uploaded into the RevenueCat dashboard and/or handed to `eas credentials`, never written into a source file.

---

## Phase 5 — Where every key/secret actually goes

Nothing below should ever be hardcoded into a `.ts`/`.tsx` file or committed to git. Here's the exact home for each:

| Secret | Client-exposed? | Where it lives |
|---|---|---|
| RevenueCat **public** API keys (Apple/Google) | Yes — RevenueCat's SDK keys are designed to ship in the client bundle | Local dev: `.env.local` (gitignored, not committed) as `EXPO_PUBLIC_RC_APPLE_KEY` / `EXPO_PUBLIC_RC_GOOGLE_KEY` — already wired in `src/revenuecat/premiumGate.ts`. Cloud builds: `eas env:create --name EXPO_PUBLIC_RC_APPLE_KEY --value <key> --visibility sensitive` (repeat for Google) so EAS injects it at build time without it ever touching the repo. |
| App Store Connect API Key (`.p8` + Key ID + Issuer ID) | **No — never client-exposed** | Run `eas credentials` → iOS → App Store Connect API Key → let EAS store it encrypted on Expo's servers. `eas.json`'s `submit.production.ios` then just references it by prompt, no raw key ever written to a file in the repo. |
| Google Play service account JSON | **No — never client-exposed** | Same idea: `eas credentials` → Android → Google Service Account, upload the JSON there. If you ever need a local copy for `eas submit` to reference by path, name it something like `google-service-account.json` and add that exact filename to `.gitignore` (it currently already ignores `.env*` and cert/key file extensions, but add this one explicitly since it's plain JSON). |
| RevenueCat's copies of the above two credentials | **No** | Entered directly into the RevenueCat dashboard UI (Phase 4) — never touches this codebase at all. |

Quick sanity check anytime: `git log --all -- '*.p8' '*.jks' '*.json' | grep -i service` should come back empty, and `git show HEAD:.env` should fail (file was never tracked).

---

## Phase 6 — Builds

```bash
# Android dev client, for the emulator (see prior answer on Android Studio/AVD setup)
eas build --profile development --platform android

# iOS dev client, for your iPhone
eas build --profile development --platform ios

# Internal test builds once RC production keys are in place
eas build --profile preview --platform android
eas build --profile preview --platform ios

# Final store builds
eas build --profile production --platform android
eas build --profile production --platform ios
```

First `ios` build will prompt to log in with your Apple Developer account and generate/select provisioning profiles and a distribution certificate — EAS manages these for you (`eas credentials` also lets you inspect/reset them later).

---

## Phase 7 — Testing tracks (start this early — it's the long pole)

- **TestFlight (iOS):** `eas submit --platform ios --profile production` after a production build uploads straight to TestFlight. Add yourself + a few testers, no minimum wait.
- **Google Play closed testing (Android):** upload the `.aab` to a Closed Testing track, invite testers via a Google Group or email list, and they must **opt in and stay opted in for 14 continuous days with at least 12 testers** before Google grants production access ([source](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)). Start this the moment you have a working preview build — it gates your production release regardless of how ready the app is.

---

## Phase 8 — Store listings

- Screenshots (iOS: 6.7" + 6.5" or similar required sizes; Android: phone + optional tablet).
- Short/full description, keywords (iOS only).
- App Privacy details (iOS) / Data safety form (Android) — declare what data the app collects (likely: none beyond RevenueCat's purchase/analytics data and any crash reporting).
- Age rating questionnaire (both stores).
- Privacy policy + terms URLs — already deployed at `https://adhd-reset-legal.vercel.app`.
- App icon — already have the branded terminal-glyph icon and splash from earlier work.

---

## Phase 9 — Submit

```bash
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

iOS: after upload, go into App Store Connect and manually attach the build to your app version and submit for review (usually 24–48h). Android: promote the tested closed-testing release to Production once the 12/14-day requirement is satisfied.
