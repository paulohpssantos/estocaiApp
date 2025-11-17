import globalStyles from "@/constants/globalStyles";
import { Usuario } from "@/src/models/usuario";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import colors from "../../../constants/colors";
import { Funcionario } from "../../../src/models/funcionario";
import { listarFuncionarios } from "../../../src/services/funcionarioService";
import { formatCelular, formatCpfCnpj } from "../../../src/utils/formatters";

export default function RelatorioFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchFuncionarios() {
        setLoading(true);
        try {
          const usuarioString = await AsyncStorage.getItem("usuario");
          if (!usuarioString) return;
          const usuario = JSON.parse(usuarioString) as Usuario;
          setUsuario(usuario);
          const data = await listarFuncionarios(usuario.cpf);
          if (isActive) setFuncionarios(data);
        } catch (e) {
          console.error("Erro ao listar funcionários:", e);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      fetchFuncionarios();
      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View style={globalStyles.containerReport}>
      <View style={globalStyles.headerCard}>
        <MaterialIcons name="groups" size={20} color={colors.primary} />
        <Text style={globalStyles.headerTitle}>Relatório de Funcionários ({funcionarios.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {funcionarios.map((funcionario, idx) => (
            <View key={idx} style={globalStyles.card}>
              {/* Linha 1: Nome (esquerda) e CPF (direita) */}
              <View style={globalStyles.cardRow}>
                <View style={[globalStyles.cardCellFull, { flex: 2 }]}>
                  <Text style={globalStyles.cardLabel}>Nome</Text>
                  <Text style={globalStyles.cardValue}>{funcionario.nome}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 2, alignItems: "flex-end" }]}>
                  <Text style={globalStyles.cardLabel}>Data Nascimento</Text>
                  <Text style={globalStyles.cardValue}>{formatCpfCnpj(funcionario.cpf)}</Text>
                </View>
              </View>
              {/* Linha 2: Cargo, Telefone */}
              <View style={globalStyles.cardRow}>
                <View style={globalStyles.cardCell}>
                  <Text style={globalStyles.cardLabel}>Cargo</Text>
                  <Text style={globalStyles.cardValue}>{funcionario.cargo}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1, alignItems: "flex-end" }]}>
                  <Text style={globalStyles.cardLabel}>Telefone</Text>
                  <Text style={globalStyles.cardValue}>{formatCelular(funcionario.telefone)}</Text>
                </View>
              </View>
              {/* Linha 3: Email */}
              <View style={globalStyles.cardRow}>
                <View style={globalStyles.cardCellFull}>
                  <Text style={globalStyles.cardLabel}>Email</Text>
                  <Text style={globalStyles.cardValue}>{funcionario.email}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        <Button
          mode="contained"
          icon="download"
          onPress={() => {}}
          style={globalStyles.primaryButton}
        >
          Exportar CSV
        </Button>
      </View>
    </View>
  );
}

