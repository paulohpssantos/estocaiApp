import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { AuthProvider } from "../src/context/AuthContext";
import revenuecatService from "../src/services/revenuecatService";

// Configure RevenueCat at module load to ensure SDK is initialized
// before any child components mount and call SDK methods.
try {
  if (Platform.OS !== 'web') {
    const iosKey = Constants.expoConfig?.extra?.REVENUECAT_IOS_API_KEY;
    const androidKey = Constants.expoConfig?.extra?.REVENUECAT_ANDROID_API_KEY;
    const apiKey = (Platform.OS === 'ios') ? iosKey : androidKey;
    if (apiKey) {
      revenuecatService.configure(apiKey);
    } else {
      console.warn('[app/_layout] RevenueCat API key missing in expo.extra');
    }
  }
} catch (e) {
  console.error('[app/_layout] RevenueCat configure error', e);
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsAuthenticated(!!token);
    };
    checkAuth();
    // RevenueCat already configured at module load
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
