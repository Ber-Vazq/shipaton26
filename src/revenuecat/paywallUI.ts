import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import type { PurchasesOffering } from "react-native-purchases";
import { ENTITLEMENT_ID } from "./premiumGate";

/**
 * RevenueCat-hosted paywall presentation.
 * Requires a Paywall to be configured in the RevenueCat dashboard for the
 * offering you pass in (or the "current" offering if you pass none).
 */

function resultUnlockedEntitlement(result: PAYWALL_RESULT): boolean {
  return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
}

/** Always shows the paywall, regardless of current entitlement status. */
export async function presentPaywall(offering?: PurchasesOffering): Promise<boolean> {
  const result = await RevenueCatUI.presentPaywall(offering ? { offering } : undefined);
  return resultUnlockedEntitlement(result);
}

/**
 * Shows the paywall only if `adhd_reset_board_pro` is not already unlocked —
 * the right call for gating a premium screen or action. Returns true if the
 * user now has the entitlement (either already had it, or just purchased/
 * restored it).
 */
export async function presentPaywallIfNeeded(offering?: PurchasesOffering): Promise<boolean> {
  const result = await RevenueCatUI.presentPaywallIfNeeded({
    ...(offering ? { offering } : {}),
    requiredEntitlementIdentifier: ENTITLEMENT_ID,
  });
  return result === PAYWALL_RESULT.NOT_PRESENTED || resultUnlockedEntitlement(result);
}

/**
 * Opens RevenueCat's pre-built Customer Center: view active subscription,
 * manage/cancel, restore purchases, request a refund (where supported by
 * the store), submit feedback. iOS 15+ and Android only.
 */
export async function presentCustomerCenter(): Promise<void> {
  await RevenueCatUI.presentCustomerCenter();
}
