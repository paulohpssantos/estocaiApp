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
  return {
    expo: {
      ...base,
      extra,
    },
  };
};
