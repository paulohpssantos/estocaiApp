import { useRouter } from "expo-router";
import { Alert, Button, Image, Linking, Text, TextInput, View } from "react-native";
import colors from "../../../constants/colors";
import globalStyles from '../../../constants/globalStyles';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';

export default function MeusDadosScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const cpf = user?.usuario?.cpf ?? "";
  const nome = user?.usuario?.nome ?? "";
  const celular = user?.usuario?.celular ?? "";
  const email = user?.usuario?.email ?? "";

  const handleDeleteAccount = async () => {
    if (!user) {
      Alert.alert(
        "Excluir conta",
        "Você não está logado. Para excluir sua conta, faça login ou entre em contato com o suporte.",
        [
          { text: "Fechar", style: "cancel" },
          { text: "Contato", onPress: () => Linking.openURL(`mailto:suporte@seudominio.com`) },
        ]
      );
      return;
    }

    Alert.alert(
      "Confirmar exclusão",
      "A exclusão da conta é irreversível. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/usuarios/${user.usuario.cpf}`);
              Alert.alert("Conta excluída", "Sua conta foi excluída com sucesso.");
              await logout();
              router.replace("/(auth)/login");
            } catch (e) {
              console.warn("Erro ao excluir conta:", e);
              Alert.alert("Erro", "Não foi possível excluir a conta. Tente novamente mais tarde.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={globalStyles.centeredContainer}>
      <View style={globalStyles.logoContainer}>
        <Image
          source={require("../../../assets/images/icon.png")}
          style={globalStyles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={globalStyles.formContainer}>
        <Text style={globalStyles.title}>Meus Dados</Text>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginVertical: 12,
          }}
        />

        <Text style={{ marginBottom: 4, color: colors.text }}>CPF</Text>
        <TextInput value={cpf} editable={false} style={globalStyles.input} />

        <Text style={{ marginBottom: 4, color: colors.text }}>Nome</Text>
        <TextInput value={nome} editable={false} style={globalStyles.input} />

        {celular ? (
          <>
            <Text style={{ marginBottom: 4, color: colors.text }}>Celular</Text>
            <TextInput value={celular} editable={false} style={globalStyles.input} />
          </>
        ) : null}

        <Text style={{ marginBottom: 4, color: colors.text }}>Email</Text>
        <TextInput value={email} editable={false} style={globalStyles.input} />

        <Button title="Excluir conta" onPress={handleDeleteAccount} color="red" />
      </View>
    </View>
  );
}
