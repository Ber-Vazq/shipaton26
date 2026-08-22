import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CustomerInfo } from "react-native-purchases";
import {
  addCustomerInfoListener,
  getCustomerInfo,
  isEntitlementActive,
  removeCustomerInfoListener,
} from "../revenuecat/premiumGate";

type PurchasesContextValue = {
  customerInfo: CustomerInfo | null;
  isPro: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

/**
 * Keeps CustomerInfo (and the derived `isPro` flag) in sync app-wide.
 * Wires UI to RevenueCat's CustomerInfoUpdateListener — per RevenueCat's own
 * guidance, screens should read from this listener-backed state rather than
 * calling getCustomerInfo() ad hoc, since updates can also arrive from
 * outside the app (e.g. a purchase made from the App Store listing).
 */
export function PurchasesProvider({ children }: { children: ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const info = await getCustomerInfo();
    if (info) setCustomerInfo(info);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const listener = (info: CustomerInfo) => setCustomerInfo(info);
    addCustomerInfoListener(listener);
    return () => removeCustomerInfoListener(listener);
  }, [refresh]);

  const value = useMemo(
    () => ({
      customerInfo,
      isPro: isEntitlementActive(customerInfo),
      loading,
      refresh,
    }),
    [customerInfo, loading, refresh]
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export function usePurchases(): PurchasesContextValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error("usePurchases must be used within a PurchasesProvider");
  return ctx;
}
