import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Image, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import { useAuth } from "../../src/context/AuthContext";

import globalStyles from '../../constants/globalStyles';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(username, password);
      router.replace("/(drawer)");
    } catch (error) {
      Alert.alert("Erro", "Usuário ou senha inválidos");
    }
  };

  return (
    <View style={globalStyles.centeredContainer}>
      <View style={globalStyles.logoContainer}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={globalStyles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={globalStyles.formContainer}>
        <Text style={globalStyles.title}>Login</Text>
        <TextInput
          placeholder="CPF"
          value={username}
          onChangeText={setUsername}
          style={globalStyles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={globalStyles.input}
        />
        <Button title="Entrar" onPress={handleLogin} color={colors.primary} />
        <Link href="/(auth)/register" asChild>
          <Text style={globalStyles.registerLink}>Criar conta</Text>
        </Link>
      </View>
      <View style={globalStyles.footer}>
        <Text style={globalStyles.footerText}>© {new Date().getFullYear()} Estocaí</Text>
        <Text style={globalStyles.footerSub}>Sistema de Gestão</Text>
      </View>
    </View>
  );
}
