# Enrolling: Apple Developer Program + Google Play Console

Do these two in parallel — they're independent. Bundle ID / package name
for both is **`com.bervazq.adhdreset`** (already set in `app.json`).

## Apple Developer Program — $99/year

1. Go to [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/).
2. Sign in with an Apple ID that has two-factor authentication enabled.
3. Choose **Individual** (organization requires a D-U-N-S number and 1–2 weeks; individual is same-day to 48h).
4. **Use your exact legal name** — an alias, nickname, or business name in the name field is the #1 cause of enrollment delays.
5. Pay the $99 fee. Verification is usually automatic within 24–48h for individuals.

Once approved you'll have access to App Store Connect, where the In-App Purchase Key gets generated (Phase 4 in `docs/STORE_SETUP.md`).

Source: [Apple Developer Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/), [membership pricing](https://developer.apple.com/support/compare-memberships/).

## Google Play Console — $25 one-time

1. Go to [play.google.com/console/signup](https://play.google.com/console/signup).
2. Sign in, accept the Developer Distribution Agreement, pay the $25 fee (credit/debit card, not prepaid).
3. Choose **Personal** account type (Organization needs a D-U-N-S number and business docs — skip unless you're incorporating).
4. **Identity verification** — Google now requires a government-issued photo ID (passport has the highest acceptance rate; national ID or driver's license also work) for essentially all new personal accounts. The name on the ID must exactly match your Google account name.
5. **Device verification — this is the one to plan around given you only have an iPhone:** new personal accounts must prove access to a real Android device by scanning a QR code with the Play Console mobile app. This is a **one-time check**, not ongoing use — you just need to briefly borrow any Android phone (a friend's, a coworker's, even a very old one) for the few minutes it takes to scan the code and confirm. It does not need to be a device you own.
6. Verify your developer contact email/phone (one-time codes sent to each).

Once through registration, you'll have Play Console access to create the app record and the closed-testing track (Phase 2/7 in `docs/STORE_SETUP.md`) — and separately, Google Cloud Console access to create the RevenueCat service account (Phase 4).

⚠️ **Timeline-critical:** the moment you have a working build, start the closed-testing track. Personal accounts created after Nov 13, 2023 need **12 testers opted in for 14 continuous days** before Google grants production access — this is a hard floor on your timeline regardless of how ready the app is, so it's worth kicking off as early as possible rather than saving it for last.

Sources: [required info for a Play Console account](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en), [developer identity verification](https://support.google.com/googleplay/android-developer/answer/10841920?hl=en), [testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).

## What to do while waiting

- Apple's 24–48h review and Google's registration are both mostly passive waits. Good use of the time: work through the Android Studio + emulator setup (for dev-client testing) and start drafting store listing copy/screenshots (Phase 8 in `docs/STORE_SETUP.md`) — neither needs the store accounts yet.
- Once either one comes through, message me and I'll walk you through that store's next step (In-App Purchase Key for Apple, or app record + service account for Google) immediately — no need to wait for both.
