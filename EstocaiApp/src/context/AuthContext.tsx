import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Usuario } from '../models/usuario';
import api from "../services/api";

interface User {
  token: string;
  usuario: Usuario;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (usuario: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let globalLogout: (() => Promise<void>) | null = null;

export const setGlobalLogout = (logoutFn: () => Promise<void>) => {
  globalLogout = logoutFn;
};

export const triggerGlobalLogout = async () => {
  if (globalLogout) await globalLogout();
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const usuarioString = await AsyncStorage.getItem("usuario");
      const usuario = usuarioString ? JSON.parse(usuarioString) : null;
      if (token && usuario) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser({ token, usuario });
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post(`/auth/login?username=${username}&password=${password}`);
      const { token, usuario } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("usuario", JSON.stringify(usuario));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ token, usuario });
    } catch (error) {
      throw error;
    }
  };

  const register = async (usuario: any) => {
    try {
      await api.post("/auth/register", usuario);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");
    setUser(null);
  };

  // Registra o logout global para ser usado pelo interceptor do axios
  useEffect(() => {
    setGlobalLogout(logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};