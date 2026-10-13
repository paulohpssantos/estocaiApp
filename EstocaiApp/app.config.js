const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load existing app.json so we keep non-sensitive config
const appJsonPath = path.resolve(__dirname, 'app.json');
let appJson = {};
try {
  appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
} catch (e) {
  console.warn('Could not read app.json, falling back to minimal config');
  appJson = { expo: {} };
}

module.exports = () => {
  const base = appJson.expo || {};
  const extra = {
    ...(base.extra || {}),
    REVENUECAT_IOS_API_KEY: process.env.REVENUECAT_IOS_API_KEY || '',
    REVENUECAT_ANDROID_API_KEY: process.env.REVENUECAT_ANDROID_API_KEY || '',
  };

  // Meta (Facebook) SDK — App ID and Client Token ship inside the app (not secrets); env overrides the defaults
  const fbAppId = process.env.FACEBOOK_APP_ID || '1286628730016920';
  const fbClientToken = process.env.FACEBOOK_CLIENT_TOKEN || '18b9d9654920b202a5348843abc3402b';
  const plugins = [...(base.plugins || [])];
  if (fbAppId && fbClientToken) {
    plugins.push(
      [
        'react-native-fbsdk-next',
        {
          appID: fbAppId,
          clientToken: fbClientToken,
          displayName: 'Estoca Fácil',
          scheme: `fb${fbAppId}`,
          // SDK is initialized in code after the ATT prompt (src/services/metaService.ts)
          isAutoInitEnabled: false,
          autoLogAppEventsEnabled: true,
          advertiserIDCollectionEnabled: true,
          iosUserTrackingPermission:
            'Usamos essa permissão para medir a eficácia dos nossos anúncios e mostrar conteúdos mais relevantes para você.',
        },
      ],
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission:
            'Usamos essa permissão para medir a eficácia dos nossos anúncios e mostrar conteúdos mais relevantes para você.',
        },
      ]
    );
  } else if (process.env.EAS_BUILD) {
    throw new Error('FACEBOOK_APP_ID e FACEBOOK_CLIENT_TOKEN precisam estar definidos no ambiente do EAS.');
  } else {
    console.warn('[app.config] FACEBOOK_APP_ID/FACEBOOK_CLIENT_TOKEN ausentes — Meta SDK não será configurado.');
  }

  return {
    expo: {
      ...base,
      plugins,
      extra,
    },
  };
};
