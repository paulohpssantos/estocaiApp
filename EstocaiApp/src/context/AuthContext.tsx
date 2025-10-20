import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import api from "../services/api";

interface User {
  token: string;
  usuario: {
    cpf: string;
    nome: string;
    celular: string;
    senha: string;
    dataExpiracao: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (usuario: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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