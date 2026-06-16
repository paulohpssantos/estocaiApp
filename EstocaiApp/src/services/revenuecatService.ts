import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export type PurchaserInfo = any;

let _configured = false;

export function configure(apiKey: string) {
  try {
    if (!apiKey) {
      console.warn('[revenuecatService] configure called without apiKey');
      return;
    }
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey });
    _configured = true;
  } catch (e) {
    console.error('[revenuecatService] configure error', e);
  }
}

export function isConfigured() {
  return _configured;
}

export async function getOfferings(): Promise<any> {
  try {
    if (!_configured) {
      const msg = '[revenuecatService] getOfferings called before configure. Make sure configure() runs on app startup and that REVENUECAT API keys are set.';
      console.error(msg);
      throw new Error(msg);
    }
    const offerings = await Purchases.getOfferings();
    return offerings ?? null;
  } catch (e) {
    console.error('[revenuecatService] getOfferings error', e);
    throw e;
  }
}

export async function purchaseProduct(productId: string): Promise<PurchaserInfo> {
  try {
    if (!_configured) {
      const msg = '[revenuecatService] purchaseProduct called before configure. Make sure configure() runs on app startup.';
      console.error(msg);
      throw new Error(msg);
    }
    // Purchases.purchaseProduct will handle both subscriptions and one-time products
    const result = await Purchases.purchaseProduct(productId);
    // result shape varies by SDK version: use runtime checks via `any` to be safe
    const info = (result as any)?.purchaserInfo ?? (result as any)?.customerInfo ?? result ?? null;
    return info;
  } catch (e) {
    console.error('[revenuecatService] purchaseProduct error', e);
    throw e;
  }
}

export async function restorePurchases(): Promise<PurchaserInfo> {
  try {
    const info = await Purchases.restorePurchases();
    return info ?? null;
  } catch (e) {
    console.error('[revenuecatService] restorePurchases error', e);
    throw e;
  }
}

export async function getPurchaserInfo(): Promise<PurchaserInfo> {
  try {
    const getter = (Purchases as any).getCustomerInfo ?? (Purchases as any).getPurchaserInfo;
    const info = getter ? await getter.call(Purchases) : null;
    return info ?? null;
  } catch (e) {
    console.error('[revenuecatService] getPurchaserInfo error', e);
    throw e;
  }
}

export default {
  configure,
  getOfferings,
  purchaseProduct,
  restorePurchases,
  getPurchaserInfo,
};
