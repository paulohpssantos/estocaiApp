import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        router.replace("/(drawer)");
      } else {
        router.replace("/(auth)/login");
      }
    };
    checkAuth();
  }, [router]);

  return null;
}
