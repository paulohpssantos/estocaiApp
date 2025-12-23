import globalStyles from "@/constants/globalStyles";
import { Usuario } from "@/src/models/usuario";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from "react";
import { Alert, Platform, ScrollView, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import colors from "../../../constants/colors";
import { OrdemServico } from "../../../src/models/ordemServico";
import { listarOrdensServico } from "../../../src/services/ordemServicoService";
import { formatDateBR, formatMoney } from "../../../src/utils/formatters";
import { setStatusBackgroundColor, setStatusBorderColor, setStatusFontColor } from "../../../src/utils/functions";

export default function RelatorioOrdens() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchOrdens() {
        setLoading(true);
        try {
          const usuarioString = await AsyncStorage.getItem("usuario");
          if (!usuarioString) return;
          const usuario = JSON.parse(usuarioString) as Usuario;
          setUsuario(usuario);
          const data = await listarOrdensServico(usuario.cpf);
          if (isActive) setOrdens(data);
        } catch (e) {
          console.error("Erro ao listar ordens de serviço:", e);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      fetchOrdens();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const exportarCSV = async () => {
      if (!ordens.length) return;
      Alert.alert('Exportando', 'Gerando arquivo CSV, aguarde...');
  
      // Cabeçalho e metadados (padrão da aplicação)
      const title = `Relatorio de Ordens de Servico/Vendas`;
      const generatedAt = new Date().toLocaleString('pt-BR');
  
      // Colunas
      const header = [
        'Número',
        'Valor',
        'Status',
        'Cliente',
        'Data Abertura'
      ];
      // Linhas
      const rows = ordens.map(ordem => [
        `"${ordem.numeroOS}"`,
        `"${formatMoney(ordem.valorTotal)}"`,
        `"${ordem.status}"`,
        `"${ordem.cliente.nome}"`,
        `"${formatDateBR(ordem.dataAbertura)}"`
      ].join(','));
  
      const csv = [title, header.join(','), ...rows].join('\n');
      const fileUri = (FileSystem as any).documentDirectory + `relatorio_ordens_${Date.now()}.csv`;
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
        <Text style={globalStyles.headerTitle}>Relatório de Ordens de Serviço/Vendas ({ordens.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {ordens.map((ordem, idx) => (
            <View key={idx} style={globalStyles.card}>
              {}
              <View style={globalStyles.cardRow}>
                <View style={[globalStyles.cardCellFull, { flex: 2 }]}>
                  <Text style={globalStyles.cardLabel}>Número</Text>
                  <Text style={globalStyles.cardValue}>{ordem.numeroOS}</Text>
                </View>
                 <View style={[globalStyles.cardCellFull, { flex: 2 }]}>
                  <Text style={globalStyles.cardLabel}>Valor</Text>
                  <Text style={globalStyles.cardValue}>{formatMoney(ordem.valorTotal)}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 2, alignItems: "flex-end" }]}>
                  <Text style={globalStyles.cardLabel}>Staus</Text>
                  <View style={ { flex: 2, alignItems: "flex-end" }}>
                  <Text
                    style={{
                        color: setStatusFontColor(ordem.status),
                        fontWeight: '600',
                        fontSize: 12,
                        borderColor: setStatusBorderColor(ordem.status),
                        borderWidth: 1,
                        alignSelf: 'flex-start', 
                        paddingHorizontal: 18,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: setStatusBackgroundColor(ordem.status),
                        minWidth: 100,
                        textAlign: 'center',
                    }}>{ordem.status}</Text></View>
                  
                </View>
              </View>
              {/* Linha 2: Cliente, data Abertura */}
              <View style={globalStyles.cardRow}>
                <View style={globalStyles.cardCell}>
                  <Text style={globalStyles.cardLabel}>Cliente</Text>
                  <Text style={globalStyles.cardValue}>{ordem.cliente.nome}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1, alignItems: "flex-end" }]}>
                  <Text style={globalStyles.cardLabel}>Data Abertura</Text>
                  <Text style={globalStyles.cardValue}>{formatDateBR(ordem.dataAbertura)}</Text>
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

