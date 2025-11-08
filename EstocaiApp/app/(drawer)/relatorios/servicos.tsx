import globalStyles from "@/constants/globalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import colors from "../../../constants/colors";
import { Servico } from "../../../src/models/servico";
import { listarServicos } from "../../../src/services/servicoService";
import { formatDurationHM, formatMoney } from "../../../src/utils/formatters";


export default function RelatorioServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchServicos() {
        setLoading(true);
        try {
          const data = await listarServicos();
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
          onPress={() => {}}
          style={globalStyles.primaryButton}
        >
          Exportar CSV
        </Button>
      </View>
    </View>
  );
}

