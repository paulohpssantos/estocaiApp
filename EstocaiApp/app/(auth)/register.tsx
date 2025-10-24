import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Image, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import { useAuth } from "../../src/context/AuthContext";

import globalStyles from '../../constants/globalStyles';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async () => {
    try {
      // Calcula data atual + 5 dias no formato yyyy-mm-dd
      const now = new Date();
      now.setDate(now.getDate() + 5);
      const dataExpiracao = now.toISOString().slice(0, 10);
      await register({ cpf, nome, celular, senha, email, dataExpiracao });
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Erro", "Falha ao cadastrar usuário");
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
        <Text style={globalStyles.title}>Cadastro</Text>
        <TextInput
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Celular"
          value={celular}
          onChangeText={setCelular}
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          style={globalStyles.input}
        />
        <Button title="Cadastrar" onPress={handleRegister} color={colors.primary} />
        <Link href="/(auth)/login" asChild>
          <Text style={globalStyles.registerLink}>Já possui conta? Entrar</Text>
        </Link>
      </View>
      <View style={globalStyles.footer}>
        <Text style={globalStyles.footerText}>© {new Date().getFullYear()} Estocaí</Text>
        <Text style={globalStyles.footerSub}>Sistema de Gestão</Text>
      </View>
    </View>
  );
}
