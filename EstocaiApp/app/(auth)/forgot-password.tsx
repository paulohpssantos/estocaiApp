import { passwordForgot } from "@/src/services/passwordService";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import globalStyles from '../../constants/globalStyles';

export default function ForgotPasswordScreen() {
  const [emailOrCpf, setEmailOrCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    setLoading(true);
    try {
      await passwordForgot(emailOrCpf);
      Alert.alert(
        "Verifique seu e-mail",
        "Enviamos um link para redefinir sua senha.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (e) {
      Alert.alert("Erro", "Não foi possível enviar o e-mail.");
    }
    setLoading(false);
  };

  return (
    <View style={globalStyles.centeredContainer}>
      <View style={globalStyles.formContainer}>
        <Text style={globalStyles.title}>Recuperar senha</Text>
        <TextInput
          placeholder="E-mail ou CPF cadastrado"
          value={emailOrCpf}
          onChangeText={setEmailOrCpf}
          style={globalStyles.input}
          keyboardType="default"
          autoCapitalize="none"
        />
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 16 }} />
        ) : (
          <Button title="Enviar" onPress={handleSend} color={colors.primary} disabled={loading} />
        )}
      </View>
    </View>
  );
}