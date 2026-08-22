import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";

/**
 * RevenueCat configuration.
 *
 * These are TEST keys for development — swap for the real public API keys
 * (one per platform, from RevenueCat dashboard > Project settings > API keys)
 * before a store submission build. Prefer env vars over hardcoding:
 * EXPO_PUBLIC_RC_APPLE_KEY / EXPO_PUBLIC_RC_GOOGLE_KEY.
 */
const IOS_API_KEY = process.env.EXPO_PUBLIC_RC_APPLE_KEY ?? "test_jizRcVJcUwnTngqudqwbdrWqdUi";
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_RC_GOOGLE_KEY ?? "test_jizRcVJcUwnTngqudqwbdrWqdUi";

/** Entitlement identifier configured in the RevenueCat dashboard. */
export const ENTITLEMENT_ID = "adhd_reset_board_pro";

let configured = false;

/** Call once, as early as possible in the app lifecycle (root layout). */
export function initPurchases(): void {
  if (configured) return;

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);

  const apiKey = Platform.OS === "ios" ? IOS_API_KEY : ANDROID_API_KEY;
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Purchases.configure({ apiKey });
    configured = true;
  }
  // No-op on web/other platforms — RevenueCat's native SDK doesn't support them here.
}

export function addCustomerInfoListener(listener: CustomerInfoUpdateListener): void {
  Purchases.addCustomerInfoUpdateListener(listener);
}

export function removeCustomerInfoListener(listener: CustomerInfoUpdateListener): void {
  Purchases.removeCustomerInfoUpdateListener(listener);
}

/** Fresh customer info from RevenueCat (forces a network refresh if cache is stale). */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    logPurchasesError("getCustomerInfo", e);
    return null;
  }
}

export function isEntitlementActive(info: CustomerInfo | null): boolean {
  if (!info) return false;
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

/** Convenience check. Fails open — don't block the core app loop if RC is unreachable. */
export async function hasPremium(): Promise<boolean> {
  const info = await getCustomerInfo();
  if (!info) return false;
  return isEntitlementActive(info);
}

/** All offerings, keyed by identifier — use to look up a non-current offering by name. */
export async function getOfferings() {
  try {
    return await Purchases.getOfferings();
  } catch (e) {
    logPurchasesError("getOfferings", e);
    return null;
  }
}

/** The dashboard's "current" offering, expected to contain monthly/annual/lifetime packages. */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const offerings = await getOfferings();
  return offerings?.current ?? null;
}

export type ResetBoardPackages = {
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
  lifetime: PurchasesPackage | null;
};

/**
 * Pulls the three packages this app sells out of the current offering, using
 * RevenueCat's reserved package types ($rc_monthly / $rc_annual / $rc_lifetime)
 * so this keeps working even if you rename the underlying store products.
 */
export async function getResetBoardPackages(): Promise<ResetBoardPackages> {
  const offering = await getCurrentOffering();
  return {
    monthly: offering?.monthly ?? null,
    annual: offering?.annual ?? null,
    lifetime: offering?.lifetime ?? null,
  };
}

export type PurchaseOutcome =
  | { status: "purchased"; customerInfo: CustomerInfo }
  | { status: "cancelled" }
  | { status: "error"; message: string; code?: PURCHASES_ERROR_CODE };

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { status: "purchased", customerInfo };
  } catch (e) {
    const err = e as PurchasesError;
    if (err?.userCancelled) return { status: "cancelled" };
    logPurchasesError("purchasePackage", err);
    return {
      status: "error",
      message: err?.message ?? "Purchase failed. Please try again.",
      code: err?.code,
    };
  }
}

export type RestoreOutcome =
  | { status: "restored"; customerInfo: CustomerInfo }
  | { status: "nothing_to_restore" }
  | { status: "error"; message: string };

export async function restorePurchases(): Promise<RestoreOutcome> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    if (isEntitlementActive(customerInfo)) {
      return { status: "restored", customerInfo };
    }
    return { status: "nothing_to_restore" };
  } catch (e) {
    const err = e as PurchasesError;
    logPurchasesError("restorePurchases", err);
    return { status: "error", message: err?.message ?? "Restore failed. Please try again." };
  }
}

function logPurchasesError(context: string, e: unknown): void {
  const err = e as PurchasesError;
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(`[RevenueCat] ${context} failed`, {
      code: err?.code,
      message: err?.message,
    });
  }
}
