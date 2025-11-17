import globalStyles from "@/constants/globalStyles";
import { Usuario } from "@/src/models/usuario";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
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
                <View style={[globalStyles.cardCellFull, { flex: 1 }]}>
                  <Text style={globalStyles.cardLabel}>Código</Text>
                  <Text style={globalStyles.cardValue}>{produto.id}</Text>
                </View>
                <View style={[globalStyles.cardCellFull, { flex: 2 }]}>
                  <Text style={globalStyles.cardLabel}>Nome</Text>
                  <Text style={globalStyles.cardValue}>{produto.nome}</Text>
                </View>
              </View>
              {/* Linha 2: valor, estoque */}
              <View style={globalStyles.cardRow}>
                <View style={globalStyles.cardCell}>
                  <Text style={globalStyles.cardLabel}>Valor Un.</Text>
                  <Text style={globalStyles.cardValue}>{formatMoney(produto.valor)}</Text>
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
          onPress={() => {}}
          style={globalStyles.primaryButton}
        >
          Exportar CSV
        </Button>
      </View>
    </View>
  );
}

