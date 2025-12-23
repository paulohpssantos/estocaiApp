import globalStyles from "@/constants/globalStyles";
import { Usuario } from "@/src/models/usuario";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from "react";
import { Alert, Platform, ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Text } from "react-native-paper";
import colors from "../../../constants/colors";
import { Cliente } from "../../../src/models/cliente";
import { listarClientes } from "../../../src/services/clienteService";
import { formatCelular, formatCpfCnpj, formatDateBR } from "../../../src/utils/formatters";


export default function RelatorioClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchClientes() {
        setLoading(true);
        try {
          const usuarioString = await AsyncStorage.getItem("usuario");
          if (!usuarioString) return;
          const usuario = JSON.parse(usuarioString) as Usuario;
          setUsuario(usuario);
          const data = await listarClientes(usuario.cpf);
          if (isActive) setClientes(data);
        } catch (e) {
          console.error("Erro ao listar clientes:", e);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      fetchClientes();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const exportarCSV = async () => {
    if (!clientes.length) return;
    Alert.alert('Exportando', 'Gerando arquivo CSV, aguarde...');

    // Cabeçalho e metadados (padrão da aplicação)
    const title = `Relatorio de Clientes`;
    const generatedAt = new Date().toLocaleString('pt-BR');

    // Colunas
    const header = [
      'Nome',
      'Data Nascimento',
      'CPF',
      'Telefone',
      'Email'
    ];
    // Linhas
    const rows = clientes.map(cliente => [
      `"${cliente.nome}"`,
      `"${formatDateBR(cliente.dataNascimento)}"`,
      `"${formatCpfCnpj(cliente.cpf)}"`,
      `"${formatCelular(cliente.telefone)}"`,
      `"${cliente.email}"`
    ].join(','));

    const csv = [title, header.join(','), ...rows].join('\n');
    const fileUri = (FileSystem as any).documentDirectory + `relatorio_clientes_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });

    try {
      if (Platform.OS === 'android') {
        // on Android convert to content URI and open with an intent
        const contentUri = await (FileSystem as any).getContentUriAsync(fileUri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          type: 'text/csv',
          flags: 1,
        });
      } else {
        // iOS: open share sheet (allows "Open in..." or saving to Files)
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Abrir relatório' });
      }
    } catch (err) {
      console.error('Erro ao abrir/compartilhar arquivo', err);
      // fallback: informar o caminho do arquivo
      Alert.alert('Arquivo gerado', `Arquivo salvo em:\n${fileUri}`);
    }
  };

  return (
    <View style={globalStyles.containerReport}>
      <View style={globalStyles.headerCard}>
        <MaterialIcons name="groups" size={20} color={colors.primary} />
        <Text style={globalStyles.headerTitle}>Relatório de Clientes ({clientes.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {clientes.map((cliente, idx) => (
            <View key={idx} style={globalStyles.card}>
              {/* Linha 1: Nome (esquerda) e Data Nascimento (direita) */}
              <View style={globalStyles.cardRow}>
                <View style={[globalStyles.cardCellFull, { flex: 2 }]}>
                  <Text style={globalStyles.cardLabel}>Nome</Text>
                  <Text style={globalStyles.cardValue}>{cliente.nome}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1, alignItems: "flex-end" }]}>
                  <Text style={globalStyles.cardLabel}>Data Nascimento</Text>
                  <Text style={globalStyles.cardValue}>{formatDateBR(cliente.dataNascimento)}</Text>
                </View>
              </View>
              {/* Linha 2: CPF, Telefone */}
              <View style={globalStyles.cardRow}>
                <View style={globalStyles.cardCell}>
                  <Text style={globalStyles.cardLabel}>CPF</Text>
                  <Text style={globalStyles.cardValue}>{formatCpfCnpj(cliente.cpf)}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1, alignItems: "flex-end" }]}>
                  <Text style={globalStyles.cardLabel}>Telefone</Text>
                  <Text style={globalStyles.cardValue}>{formatCelular(cliente.telefone)}</Text>
                </View>
              </View>
              {/* Linha 3: Email */}
              <View style={globalStyles.cardRow}>
                <View style={globalStyles.cardCellFull}>
                  <Text style={globalStyles.cardLabel}>Email</Text>
                  <Text style={globalStyles.cardValue}>{cliente.email}</Text>
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
          onPress={exportarCSV}
          style={globalStyles.primaryButton}
        >
          Exportar CSV
        </Button>
      </View>
    </View>
  );
}

