import * as RNIap from 'react-native-iap';

// Lightweight types
export type IAPProduct = any;
export type IAPPurchase = any;

let purchaseUpdateSubs: any = null;
let purchaseErrorSubs: any = null;

export const IAPResponseCode = {
  OK: 'OK',
  USER_CANCELED: 'USER_CANCELED',
  ERROR: 'ERROR',
};

export async function connect(): Promise<void> {
  await RNIap.initConnection();
}

export async function disconnect(): Promise<void> {
  try {
    if (purchaseUpdateSubs && purchaseUpdateSubs.remove) purchaseUpdateSubs.remove();
    if (purchaseErrorSubs && purchaseErrorSubs.remove) purchaseErrorSubs.remove();
  } catch (e) {
    // noop
  }
  try {
    await RNIap.endConnection();
  } catch (e) {
    // noop
  }
}

export async function getProducts(productIds: string[]): Promise<IAPProduct[]> {
  // Validate input first to avoid "No SKUs provided" runtime errors from the native SDK.
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new Error('[iapService] getProducts: productIds must be a non-empty string array of SKUs (e.g. ["com.app.prod1"])');
  }

  // Some versions of `react-native-iap` expose `getProducts`, others `fetchProducts`.
  // Use a runtime fallback and cast to `any` to avoid TypeScript signature mismatches.
  const fetchFn = (RNIap as any).getProducts ?? (RNIap as any).fetchProducts;
  if (!fetchFn) {
    throw new Error('[iapService] react-native-iap: no getProducts/fetchProducts available');
  }

  const products = await fetchFn(productIds);
  return products ?? [];
}

export async function purchaseItem(productId: string): Promise<any> {
  // `react-native-iap` typings may require a RequestPurchase object in some versions.
  // Cast to `any` to remain compatible with string SKU usage across versions.
  try {
    const requestFn = (RNIap as any).requestPurchase ?? (RNIap as any).requestPurchaseAndroid ?? (RNIap as any).requestSubscription ?? null;
    if (!requestFn) {
      throw new Error('[iapService] react-native-iap: no requestPurchase available');
    }
    return await requestFn(productId as unknown as any);
  } catch (e) {
    throw e;
  }
}

export async function finishTransaction(purchase: any, isConsumable = false): Promise<void> {
  try {
    // react-native-iap exposes finishTransaction which handles platform differences
    const finishFn = (RNIap as any).finishTransaction ?? (RNIap as any).finishTransactionAndroid ?? (RNIap as any).finishTransactionIos ?? null;
    if (!finishFn) {
      throw new Error('[iapService] react-native-iap: finishTransaction not available');
    }
    // Some versions define finishTransaction with a single argument; call accordingly.
    if ((finishFn as any).length >= 2) {
      await finishFn(purchase, isConsumable);
    } else {
      await finishFn(purchase);
    }
  } catch (e) {
    console.error('[iapService] finishTransaction error', e);
    throw e;
  }
}

export async function restorePurchases(): Promise<IAPPurchase[]> {
  const purchases = await RNIap.getAvailablePurchases();
  return purchases ?? [];
}

export function setPurchaseListener(cb: (event: any) => void): void {
  // remove existing listeners if any
  try {
    if (purchaseUpdateSubs && purchaseUpdateSubs.remove) purchaseUpdateSubs.remove();
    if (purchaseErrorSubs && purchaseErrorSubs.remove) purchaseErrorSubs.remove();
  } catch (e) {
    // noop
  }

  purchaseUpdateSubs = RNIap.purchaseUpdatedListener((purchase: any) => {
    // normalize to previous shape: { responseCode, results }
    cb({ responseCode: IAPResponseCode.OK, results: [purchase] });
  });

  purchaseErrorSubs = RNIap.purchaseErrorListener((error: any) => {
    // try to detect user cancel
    const code = error?.code ?? error?.message ?? 'UNKNOWN';
    if (code === 'E_USER_CANCELLED' || (typeof error?.message === 'string' && /cancel/i.test(error.message))) {
      cb({ responseCode: IAPResponseCode.USER_CANCELED, errorCode: code });
    } else {
      cb({ responseCode: IAPResponseCode.ERROR, errorCode: code });
    }
  });
}

export default {
  connect,
  disconnect,
  getProducts,
  purchaseItem,
  finishTransaction,
  restorePurchases,
  setPurchaseListener,
  IAPResponseCode,
};
