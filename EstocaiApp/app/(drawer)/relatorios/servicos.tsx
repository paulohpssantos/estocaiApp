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
import { Servico } from "../../../src/models/servico";
import { listarServicos } from "../../../src/services/servicoService";
import { formatDurationHM, formatMoney } from "../../../src/utils/formatters";


export default function RelatorioServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchServicos() {
        setLoading(true);
        try {
          const usuarioString = await AsyncStorage.getItem("usuario");
          if (!usuarioString) return;
          const usuario = JSON.parse(usuarioString) as Usuario;
          setUsuario(usuario);
          const data = await listarServicos(usuario.cpf);
          if (isActive) setServicos(data);
        } catch (e) {
          console.error("Erro ao listar serviços:", e);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      fetchServicos();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const exportarCSV = async () => {
          if (!servicos.length) return;
           Alert.alert('Exportando', 'Gerando arquivo CSV, aguarde...');
      
          // Cabeçalho e metadados (padrão da aplicação)
          const title = `Relatorio de Serviços`;
          const generatedAt = new Date().toLocaleString('pt-BR');
      
          // Colunas
          const header = [
            'Nome',
            'Valor',
            'Duração'
          ];
          // Linhas
          const rows = servicos.map(servico => [
            `"${servico.nome}"`,
            `"${formatMoney(servico.valor)}"`,
            `"${formatDurationHM(servico.duracao)}"`
          ].join(','));
      
          const csv = [title, header.join(','), ...rows].join('\n');
          const fileUri = (FileSystem as any).documentDirectory + `relatorio_servicos_${Date.now()}.csv`;
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
        <Text style={globalStyles.headerTitle}>Relatório de Serviços ({servicos.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {servicos.map((servico, idx) => (
            <View key={idx} style={globalStyles.card}>
              {/* Linha 1: Código (esquerda) e Nome(direita) */}
              <View style={globalStyles.cardRow}>
                <View style={[globalStyles.cardCellFull, { flex: 2 }]}>
                  <Text style={globalStyles.cardLabel}>Nome</Text>
                  <Text style={globalStyles.cardValue}>{servico.nome}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1 }]}>
                  <Text style={globalStyles.cardLabel}>Valor</Text>
                  <Text style={globalStyles.cardValue}>{formatMoney(servico.valor)}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1 }]}>
                  <Text style={globalStyles.cardLabel}>Duração</Text>
                  <Text style={globalStyles.cardValue}>{formatDurationHM(servico.duracao)}</Text>
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

