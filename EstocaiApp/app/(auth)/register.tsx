import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import { useAuth } from "../../src/context/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async () => {
    try {
      await register({ cpf, nome, celular, senha, dataExpiracao: "2030-10-13" });
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Erro", "Falha ao cadastrar usuário");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.registerTitle}>Cadastro</Text>
        <TextInput
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          style={styles.input}
        />
        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />
        <TextInput
          placeholder="Celular"
          value={celular}
          onChangeText={setCelular}
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          style={styles.input}
        />
        <Button title="Cadastrar" onPress={handleRegister} color={colors.primary} />
        <Link href="/(auth)/login" asChild>
          <Text style={styles.registerLink}>Já possui conta? Entrar</Text>
        </Link>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} Estocaí</Text>
        <Text style={styles.footerSub}>Sistema de Gestão</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  formContainer: {
    width: "100%",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  registerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  registerLink: {
    marginTop: 15,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 0,
  },
  footerText: {
    color: colors.secondary,
    fontWeight: "600",
  },
  footerSub: {
    color: colors.mediumGray,
    fontSize: 12,
  },
});
