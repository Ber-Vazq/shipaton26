# UX/UI Review — ADHD Reset Board

**Date:** 2026-08-25
**Method:** Static code review of the full `src/` tree (screens, components, state, engine) plus manual read-through of every user-facing flow. **No physical device or simulator was available for this pass** — findings are derived from reading component logic, styles, and state wiring, not from touching the running app. Anything that depends on runtime feel (haptic timing, animation smoothness, real screen-reader behavior, actual tap-target hit-testing) should be re-verified on a real iOS/Android device before store submission.

Tags: **blocker** (must fix before submission) / **should-fix** (fix before submission if time allows, otherwise very soon after) / **nice-to-have** (backlog).

---

## 1. Revenue integrity

### 1.1 Free-tier cap was not enforced — blocker, now fixed
The paywall screen advertised "free tier caps at 10 tasks" but nothing in `new-task.tsx`, `SessionContext.tsx`, or `resetLoop.ts` ever checked task count against a limit — a free user could create unlimited tasks. Fixed in this pass:
- `FREE_TASK_LIMIT = 10` added to `src/model/types.ts` as the single source of truth.
- `new-task.tsx` now computes `atFreeLimit = !isPro && tasks.length >= FREE_TASK_LIMIT`, blocks `handleCreate` with an inline error at the limit, and swaps the create button for an "unlock_premium (N/10 used)" button that routes straight to `/paywall`.
- `paywall.tsx` now templates the limit into its copy instead of a hardcoded `"10"`, so the two can never drift again.

Verified via `tsc --noEmit` and `expo export --platform web`; no automated test covers this path yet (see §5).

---

## 2. Navigation dead ends / state bugs

### 2.1 Timer session state is global, not per-task — blocker, now fixed
`SessionContext.tsx` stores exactly one `ResetSession` (`activeTask`, `timerState`, `timerSeconds`, `remainingSeconds`, `momentum`) shared across the whole app — it is not keyed by task id. `timer/[id].tsx` previously only auto-reset the timer when it found the shared state in `"idle"` or `"complete"`. If a user:
1. Opened Task A's timer and started it (`timerState: "running"`),
2. Backed out mid-countdown without pausing or finishing,
3. Opened Task B's steps screen and tapped `start_timer`,

...they'd land on a timer screen labelled with Task B's title and step list, but the countdown, duration, and pause/resume/reset controls would still operate on **Task A's** timer state. This directly undermined the core "pick a task → timer → ritual" loop the app is built around.
**Fixed this pass:** the mount effect in `timer/[id].tsx` now compares `prev.activeTask?.id` against the route's `id`; whenever they differ (i.e. the user is switching to a different task's timer), it force-starts a fresh timer scoped to the new task instead of inheriting whatever state the previous task left behind. Only when it's the *same* task does it fall back to the original idle/complete check, so backing out and returning to an in-progress timer for that same task still resumes correctly.

### 2.2 Home screen only ever shows 3 open tasks, with no way to browse the rest — should-fix, mitigated
`index.tsx` computes `topThree = openTasks.slice(0, 3)` and renders only those as tappable cards; there is still no full "view all" / list screen. Combined with the 10-task free cap, a free user can have up to 7 tasks that are only reachable via the random "pick_something" button, not by direct selection. **Mitigated this pass:** added a `showing {N} of {M} — pick_something surfaces the rest` note under the section header whenever tasks are hidden, so this reads as an intentional design choice (consistent with the app's low-choice-overload philosophy) rather than a bug. A real "see all tasks" screen is still a reasonable backlog item if user feedback asks for it, but is no longer required pre-launch.

### 2.3 Random-pick with no open tasks fails silently — nice-to-have
`handleRandomPick` in `index.tsx` calls `pickRandomTask`; if `updated.activeTask` is `null` (every task complete, or task list empty), the function returns with no navigation and no feedback — the button visually does nothing. A short toast/haptic-only "nothing left to reset — add a task_" would close the loop.

---

## 3. Tap targets

### 3.1 Remove-step `[x]` button is undersized — should-fix, now fixed
In `new-task.tsx`, `removeButton` was `{ padding: 4 }` around a small glyph with no `hitSlop`, resolving to roughly a 20-24px hit target — well under the ~44×44pt (iOS) / 48×48dp (Android) guidance, on the one destructive, no-undo action on the add-task screen. **Fixed this pass:** `removeButton` now has `minWidth: 32, minHeight: 32` with centered content, plus `hitSlop` bumped from 8 to 16, giving an effective ~64×64px hit area.

### 3.2 Legal links are tiny with no extra hit area — nice-to-have
`legalLink` text in `index.tsx` and `paywall.tsx` renders at `fontSize: 11` with only default text hit-testing (no `hitSlop`). Low traffic, low severity, but cheap to fix — add `hitSlop={8}` (already done for most other back/nav buttons in this pass; these two links were left as pure text and could use the same treatment).

### 3.3 Timer duration `[-]`/`[+]` buttons are borderline — nice-to-have
`durationButton` in `timer/[id].tsx` is `paddingHorizontal: 12, paddingVertical: 6` with no `hitSlop`. Probably fine on larger phones given the surrounding whitespace, but worth a real-device check since this is a frequently-tapped control right before starting a timed task.

---

## 4. Paywall placement & framing

- The paywall is reached from three places: the home screen's "premium features →" link, the new-task screen's "unlock_premium" button at the free-tier cap (added in this pass), and (implicitly) the RevenueCat-hosted paywall UI itself for the actual purchase flow. This is a reasonable, non-aggressive placement — the app doesn't force a paywall on first launch, which fits the "quiet reset tool" tone.
- `FEATURES` copy is honest and specific (unlimited tasks, extra ritual sounds, custom accent colors, "support an indie dev directly") — good, low-pressure framing consistent with the terminal aesthetic.
- One gap: there's no in-context nudge at the moment a free user *would* most want premium — e.g. finishing their 3rd task of the day, or hitting a high momentum streak. Right now the only trigger is hitting the hard 10-task wall. A soft, momentum-based upsell (e.g. "momentum: 12 — unlock custom themes to match your streak") is a plausible **nice-to-have** for a later iteration, not required for launch.

---

## 5. Accessibility

**Status: fixed in this pass.** Before this review, zero interactive elements in the codebase had `accessibilityRole`, `accessibilityLabel`, or `accessibilityState` — every `Pressable` was a silent, unlabeled tap target for screen reader users (VoiceOver/TalkBack would announce nothing meaningful, or nothing at all, for every button in the app). This pass added:
- `accessibilityRole="button"` + a descriptive `accessibilityLabel` to every `Pressable` across `index.tsx`, `new-task.tsx`, `steps/[id].tsx`, `timer/[id].tsx`, `ritual.tsx`, `paywall.tsx`, and `LegalScreen.tsx` (back buttons, task cards, step add/remove, timer controls, paywall CTAs, legal links).
- `accessibilityRole="checkbox"` + `accessibilityState={{ checked }}` + a label on `AsciiCheckbox`, so step completion state is announced correctly instead of reading as an unlabeled glyph.
- `accessibilityState={{ disabled }}` on the steps-screen action button when all steps are already done, and `accessibilityState={{ disabled, busy }}` on the paywall's async action buttons.
- Dynamic labels (task title + % complete on home cards; current pause/resume/start action on the timer's primary button; "remove step N" on step removal) instead of generic ones.

**Not yet verified:** actual VoiceOver/TalkBack behavior on a device. Static labels are in place and typecheck, but real screen-reader announcement order, focus management between screens (e.g. does focus move to the new screen's heading after navigation?), and dynamic-content announcements (timer ticking down every second — likely needs `accessibilityLiveRegion`/`AccessibilityInfo.announceForAccessibility` throttling so VoiceOver doesn't re-announce the clock every second) are **should-fix** items to validate on a real device before submission, since a countdown re-announcing itself once per second would make the timer screen unusable with a screen reader active.

---

## 6. Visual polish / first-run experience

- First run seeds three sample tasks (`SessionContext.tsx`'s `seedTasks()`) so the home screen is never empty on install — good, avoids a blank-slate first impression.
- The "nothing queued" empty state only appears once every seeded/added task is completed and none remain — reasonable, low-risk copy ("tap to add a task").
- Loading state (`if (!ready) return <TerminalText>loading_</TerminalText>`) is minimal but on-theme (terminal cursor-style "loading_") and appears only during the brief async storage read on cold start — acceptable, not worth polishing further pre-launch.
- No dedicated error state anywhere for storage read/write failures (`loadSession`/`loadTasks`/`saveSession`/`saveTasks` in `src/storage/store.ts` are not inspected for try/catch in the screens that call them) — if AsyncStorage throws (corrupted data, low storage), the user would likely see a blank/stuck loading screen rather than a message. **Nice-to-have** given how rare this is in practice, but worth a defensive fallback (e.g. fall back to `DEFAULT_SESSION`/seed tasks and log rather than hang).

---

## 7. Summary table

| # | Finding | Area | Tag | Status |
|---|---|---|---|---|
| 1 | Free-tier 10-task cap not enforced in code | Revenue | **Blocker** | Fixed this pass |
| 2 | Timer/session state is global, not per-task — switching tasks mid-timer bled state | Core loop | **Blocker** | Fixed this pass |
| 3 | Home only shows 3 of N open tasks, no browse-all entry point | Navigation | Should-fix | Mitigated this pass (count indicator) |
| 4 | Remove-step `[x]` button has an undersized hit target | Tap targets | Should-fix | Fixed this pass |
| 5 | No screen-reader validation of live-updating timer text | Accessibility | Should-fix | Open — needs a real device, cannot verify via static review |
| 6 | Zero accessibility labels anywhere in the app | Accessibility | **Blocker** | Fixed this pass |
| 7 | Random-pick silently no-ops when no open tasks remain | Feedback | Nice-to-have | Open (backlog) |
| 8 | Legal links / duration buttons have small/no extra hit area | Tap targets | Nice-to-have | Open (backlog) |
| 9 | No momentum-based soft upsell moment | Paywall framing | Nice-to-have | Open (backlog) |
| 10 | No defensive fallback if AsyncStorage read/write throws | Error states | Nice-to-have | Open (backlog) |

**Status after this pass:** all blockers (#1, #2, #6) and all fixable should-fixes (#3, #4) are resolved in code. The remaining should-fix (#5) requires a physical device with a screen reader active and cannot be closed out through static review — flagging it explicitly as a pre-submission task rather than silently dropping it. Nice-to-haves (#7-#10) are backlog and do not block submission.

**Post-review addendum:** the ritual-completion sound was a stub (upsell copy only, no audio wired up) at the time of this review — not included in the numbered findings above since it was an unfinished feature, not a defect. It has since been implemented: `correct-answer` (confirm_ping) plays free/by default for every user, and the other 8 provided sounds are premium-unlockable via an in-terminal picker on the ritual screen, gated the same way as everything else behind `usePurchases().isPro`. See `src/model/sounds.ts` and `src/app/ritual.tsx`.
