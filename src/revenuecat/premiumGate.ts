import Purchases, { LOG_LEVEL, type PurchasesPackage } from "react-native-purchases";
import { Platform } from "react-native";

// TODO (before beta build): move these into app.config.ts env vars
// (EXPO_PUBLIC_RC_APPLE_KEY / EXPO_PUBLIC_RC_GOOGLE_KEY) instead of hardcoding.
// Fill these in once the RevenueCat project + entitlement are created — see
// README "RevenueCat setup" section for the dashboard steps.
const APPLE_KEY = process.env.EXPO_PUBLIC_RC_APPLE_KEY ?? "appl_YOUR_KEY_HERE";
const GOOGLE_KEY = process.env.EXPO_PUBLIC_RC_GOOGLE_KEY ?? "goog_YOUR_KEY_HERE";

export const PREMIUM_ENTITLEMENT_ID = "premium_reset";

let configured = false;

export function initPurchases(): void {
  if (configured) return;
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  Purchases.configure({
    apiKey: Platform.OS === "ios" ? APPLE_KEY : GOOGLE_KEY,
  });
  configured = true;
}

export async function hasPremium(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
  } catch {
    return false; // fail open — don't block the core app loop if RC is unreachable
  }
}

export async function getMonthlyPackage(): Promise<PurchasesPackage | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.monthly ?? null;
  } catch {
    return null;
  }
}

export async function purchasePremium(): Promise<boolean> {
  try {
    const pkg = await getMonthlyPackage();
    if (!pkg) return false;
    await Purchases.purchasePackage(pkg);
    return true;
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}
