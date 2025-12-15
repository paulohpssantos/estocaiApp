import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, BackHandler, Button, Image, Linking, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import env from "../../constants/env";
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
      // Calcula data atual + 7 dias no formato yyyy-mm-dd
      const now = new Date();
      now.setDate(now.getDate() + 7);
      const dataExpiracao = now.toISOString().slice(0, 10);
      const dataCadastro = new Date().toISOString().slice(0, 10);
      const dataInicioPlano = new Date().toISOString().slice(0, 10);
      //const ultimoAcesso = new Date().toISOString().slice(0, 10);
      const plano = "GRATUITO";
      const leuContrato = false;

      // 1) cadastra o usuário — se falhar, mostra erro e aborta
      try {
        await register({
          cpf,
          nome,
          celular,
          senha,
          email,
          dataExpiracao,
          dataCadastro,
          dataInicioPlano,
          //ultimoAcesso,
          plano,
          leuContrato,
        } as any);
      } catch (e) {
        console.warn("registrar usuario erro:", e);
        Alert.alert("Erro", "Falha ao cadastrar usuário.");
        return;
      }

      // 2) abre a página de termos no navegador usando a URL do backend
      const termosUrl = `${env.API_URL.replace(/\/$/, "")}/termos-uso/open?cpf=${encodeURIComponent(cpf)}`;
      try {
        const canOpen = await Linking.canOpenURL(termosUrl);
        if (canOpen) {
          await Linking.openURL(termosUrl);
        } else {
          console.warn("Não foi possível abrir a URL dos termos:", termosUrl);
          Alert.alert("Sucesso", `Usuário cadastrado. Abra a URL dos termos:\n\n${termosUrl}`);
        }
      } catch (e) {
        console.warn("Erro ao abrir URL dos termos:", e);
        Alert.alert("Aviso", "Usuário cadastrado, mas não foi possível abrir os termos automaticamente.");
      }

      //alterado para fechar o app
      BackHandler.exitApp();

      // 3) informa sucesso e dá opção de ir para login
      // Alert.alert(
      //   "Sucesso",
      //   "Usuário cadastrado com sucesso! Deseja ir para a tela de login?",
      //   [
      //     {
      //       text: "Ir para login",
      //       onPress: () => router.replace("/(auth)/login"),
      //     },
      //     {
      //       text: "Depois",
      //       style: "cancel",
      //     },
      //   ]
      // );
    } catch (error) {
      console.warn("Erro geral ao cadastrar:", error);
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
        <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                marginVertical: 12,
              }}
            />
        <Text style={{ marginBottom: 4, color: colors.text }}>CPF</Text>    
        <TextInput
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          style={globalStyles.input}
        />
        <Text style={{ marginBottom: 4, color: colors.text }}>Nome</Text>
        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={globalStyles.input}
        />
        <Text style={{ marginBottom: 4, color: colors.text }}>Celular</Text>
        <TextInput
          placeholder="Celular"
          value={celular}
          onChangeText={setCelular}
          style={globalStyles.input}
        />
        <Text style={{ marginBottom: 4, color: colors.text }}>Email</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={globalStyles.input}
        />
        <Text style={{ marginBottom: 4, color: colors.text }}>Senha</Text>
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
        <Text style={globalStyles.footerText}>© {new Date().getFullYear()} Estoca Fácil</Text>
        <Text style={globalStyles.footerSub}>Sistema de Gestão</Text>
      </View>
    </View>
  );
}