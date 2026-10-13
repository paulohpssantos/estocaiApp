import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { AppState, Platform } from 'react-native';
import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';

let _initialized = false;

// iOS only shows the ATT prompt while the app is active; at launch it may still be inactive.
function waitUntilActive(): Promise<void> {
  if (AppState.currentState === 'active') return Promise.resolve();
  return new Promise((resolve) => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sub.remove();
        resolve();
      }
    });
  });
}

// Asks for ATT permission on iOS, passes the answer to the Meta SDK and then
// initializes it. Auto-logged events (install, app open) are sent on init.
export async function initMeta() {
  if (_initialized || Platform.OS === 'web') return;
  try {
    if (Platform.OS === 'ios') {
      let { status } = await getTrackingPermissionsAsync();
      if (status === 'undetermined') {
        await waitUntilActive();
        ({ status } = await requestTrackingPermissionsAsync());
      }
      await Settings.setAdvertiserTrackingEnabled(status === 'granted');
    }
    Settings.initializeSDK();
    _initialized = true;
  } catch (e) {
    console.error('[metaService] init error', e);
  }
}

function safeLog(fn: () => void) {
  if (Platform.OS === 'web') return;
  try {
    fn();
  } catch (e) {
    console.error('[metaService] log error', e);
  }
}

export function logCompleteRegistration() {
  safeLog(() =>
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration, {
      [AppEventsLogger.AppEventParams.RegistrationMethod]: 'cpf',
    })
  );
}

export function logStartTrial() {
  safeLog(() =>
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.StartTrial, 0, {
      [AppEventsLogger.AppEventParams.Currency]: 'BRL',
    })
  );
}

export function logSubscribe(value: number, plano: string, currency = 'BRL') {
  safeLog(() =>
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.Subscribe, value, {
      [AppEventsLogger.AppEventParams.Currency]: currency,
      [AppEventsLogger.AppEventParams.ContentID]: plano,
    })
  );
}

export default {
  initMeta,
  logCompleteRegistration,
  logStartTrial,
  logSubscribe,
};
