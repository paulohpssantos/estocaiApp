import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Image, Linking, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import env from "../../constants/env";
import globalStyles from '../../constants/globalStyles';
import { useAuth } from "../../src/context/AuthContext";

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

  const handleOpenTermos = async () => {
    const cpf = "";
    const termosUrl = `${env.API_URL.replace(/\/$/, "")}/termos-uso/termos-uso.html`;
    try {
      const canOpen = await Linking.canOpenURL(termosUrl);
      if (canOpen) {
        await Linking.openURL(termosUrl);
      } else {
        console.warn("Não foi possível abrir a URL dos termos:", termosUrl);
        Alert.alert("Aviso", `Não foi possível abrir automaticamente. Abra a URL manualmente:\n\n${termosUrl}`);
      }
    } catch (e) {
      console.warn("Erro ao abrir URL dos termos:", e);
      Alert.alert("Aviso", "Não foi possível abrir os termos automaticamente.");
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
        <Link href="/(auth)/forgot-password" asChild>
          <Text style={globalStyles.registerLink}>Esqueci minha senha</Text>
        </Link>
      </View>
      <Text
          onPress={handleOpenTermos}
          style={[globalStyles.registerLink, { marginTop: 6 }]}
        >
          Termos de uso
        </Text>
      <View style={globalStyles.footer}>
        <Text style={globalStyles.footerText}>© {new Date().getFullYear()} Estoca Fácil</Text>
        <Text style={globalStyles.footerSub}>Sistema de Gestão</Text>
      </View>
    </View>
  );
}
