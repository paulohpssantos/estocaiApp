import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import env from "../../constants/env";
import { triggerGlobalLogout } from "../context/AuthContext";

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

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      await triggerGlobalLogout();
    }
    return Promise.reject(error);
  }
);

export default api;