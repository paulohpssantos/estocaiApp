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
import { Produto } from "../../../src/models/produto";
import { listarProdutos } from "../../../src/services/produtoService";
import { formatDateBR, formatMoney } from "../../../src/utils/formatters";
import { verifyIsLowStock } from "../../../src/utils/functions";

export default function RelatorioProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchProdutos() {
        setLoading(true);
        try {
          const usuarioString = await AsyncStorage.getItem("usuario");
          if (!usuarioString) return;
          const usuario = JSON.parse(usuarioString) as Usuario;
          setUsuario(usuario);
          const data = await listarProdutos(usuario.cpf);
          if (isActive) setProdutos(data);
        } catch (e) {
          console.error("Erro ao listar produtos:", e);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      fetchProdutos();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const exportarCSV = async () => {
        if (!produtos.length) return;
         Alert.alert('Exportando', 'Gerando arquivo CSV, aguarde...');
    
        // Cabeçalho e metadados (padrão da aplicação)
        const title = `Relatorio de Produtos`;
        const generatedAt = new Date().toLocaleString('pt-BR');
    
        // Colunas
        const header = [
          'Nome',
          'Valor Un.',
          'Estoque Min.',
          'Estoque',
          'Data Fabricação',
          'Data Validade'
        ];
        // Linhas
        const rows = produtos.map(produto => [
          `"${produto.nome}"`,
          `"${formatMoney(produto.valor)}"`,
          `"${produto.estoqueMinimo}"`,
          `"${produto.qtdEstoque}"`,
          `"${formatDateBR(produto.dataFabricacao)}"`,
          `"${formatDateBR(produto.dataValidade)}"`
        ].join(','));
    
        const csv = [title, header.join(','), ...rows].join('\n');
        const fileUri = (FileSystem as any).documentDirectory + `relatorio_produtos_${Date.now()}.csv`;
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
        <Text style={globalStyles.headerTitle}>Relatório de Produtos ({produtos.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {produtos.map((produto, idx) => (
            <View key={idx} style={globalStyles.card}>
              {/* Linha 1: Código (esquerda) e Nome(direita) */}
              <View style={globalStyles.cardRow}>
                <View style={[globalStyles.cardCellFull, { flex: 2 }]}>
                  <Text style={globalStyles.cardLabel}>Nome</Text>
                  <Text style={globalStyles.cardValue}>{produto.nome}</Text>
                </View>
              </View>
              {/* Linha 2: valor, estoque min e estoque */}
              <View style={globalStyles.cardRow}>
                <View style={globalStyles.cardCell}>
                  <Text style={globalStyles.cardLabel}>Valor Un.</Text>
                  <Text style={globalStyles.cardValue}>{formatMoney(produto.valor)}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1, alignItems: "center" }]}>
                  <Text style={globalStyles.cardLabel}>Estoque Min.</Text>
                  <Text style={globalStyles.cardValue}>{produto.estoqueMinimo}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1, alignItems: "flex-end" }]}>
                  <Text style={globalStyles.cardLabel}>Estoque</Text>
                  <Text style={{
                    color: verifyIsLowStock(produto.qtdEstoque, produto.estoqueMinimo) ? colors.background: colors.darkGreen,
                    fontWeight: '600',
                    fontSize: 15,
                    marginBottom: 0,
                    backgroundColor: verifyIsLowStock(produto.qtdEstoque, produto.estoqueMinimo) ? colors.primary : colors.backgroundGreen,
                    borderColor: verifyIsLowStock(produto.qtdEstoque, produto.estoqueMinimo) ? colors.primary : colors.greenBorder,
                    borderWidth: 1,
                    alignSelf: 'flex-end',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12
                    }}>{produto.qtdEstoque}</Text>
                </View>
              </View>
              <View style={globalStyles.cardRow}>
                <View style={[globalStyles.cardCellFull, { flex: 2 }]}>
                  <Text style={globalStyles.cardLabel}>Data Fabricação</Text>
                  <Text style={globalStyles.cardValue}>{formatDateBR(produto.dataFabricacao)}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 1, alignItems: "flex-end" }]}>
                  <Text style={globalStyles.cardLabel}>Data Validade</Text>
                  <Text style={globalStyles.cardValue}>{formatDateBR(produto.dataValidade)}</Text>
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

