module.exports = function withNetworkConfig(config) {
  return {
    ...config,
    android: {
      ...config.android,
      usesCleartextTraffic: true,
      networkSecurityConfig: "./android/app/src/main/res/xml/network_security_config.xml",
    },
  };
};