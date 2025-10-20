import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import env from "../../constants/env";

const api = axios.create({
  baseURL: env.API_URL,
});

// Intercepta e adiciona o token JWT automaticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;