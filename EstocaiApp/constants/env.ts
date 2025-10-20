const ENV = {
  dev: {
    API_URL: "http://localhost:8080",
  },
  prod: {
    API_URL: "https://34.210.83.46:8080",
  },
};

const getEnv = () => {
  // Expo: process.env.NODE_ENV ou __DEV__
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnv();