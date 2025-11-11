import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import colors from '../../constants/colors';
import globalStyles from '../../constants/globalStyles';
import { OrdemServico } from '../../src/models/ordemServico';
import { countClientes } from '../../src/services/clienteService';
import { countEstabelecimentos } from '../../src/services/estabelecimentoService';
import { countFuncionarios } from '../../src/services/funcionarioService';
import { listarOrdensServico } from '../../src/services/ordemServicoService';
import { countProdutos, listarProdutos } from '../../src/services/produtoService';
import { countServicos } from '../../src/services/servicoService';
import { formatDateBR, formatMoney } from '../../src/utils/formatters';
import { isExpired, isNearExpiration } from '../../src/utils/functions';



const CARD_DATA = [
  { key: 'estabelecimentos', label: 'Estabelecimentos', icon: 'office-building', color: colors.primary },
  { key: 'funcionarios', label: 'Funcionários', icon: 'account-group', color: colors.primary },
  { key: 'clientes', label: 'Clientes', icon: 'account', color: colors.primary },
  { key: 'produtos', label: 'Produtos', icon: 'cube-outline', color: colors.primary },
  { key: 'servicos', label: 'Serviços', icon: 'cog-outline', color: colors.primary },
  { key: 'ordens', label: 'Ordens de serviço', icon: 'file-document-outline', color: colors.primary },
];



function getValidadeStatus(dateStr: string) {
  let isVencido = isExpired(dateStr);
  let isPertoVencimento = isNearExpiration(dateStr);

  return { isVencido, isPertoVencimento };
}

export default function Dashboard() {
  const [totals, setTotals] = useState({
    estabelecimentos: 0,
    funcionarios: 0,
    clientes: 0,
    produtos: 0,
    servicos: 0,
    ordens: 0,
  });

  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState<any[]>([]);
  const [produtosPertoVencer, setProdutosPertoVencer] = useState<any[]>([]);
  const [produtosVencidos, setProdutosVencidos] = useState<any[]>([]);
  const [ordensAbertas, setOrdensAbertas] = useState<OrdemServico[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      async function fetchDashboardData() {
        const usuarioString = await AsyncStorage.getItem("usuario");
        let cpfUsuario = "";
        if (usuarioString) {
          const usuario = JSON.parse(usuarioString);
          cpfUsuario = usuario.cpf;
        }
        const [
          estabelecimentos,
          funcionarios,
          clientes,
          produtosCount,
          servicos,
          ordensArr,
          produtos
        ] = await Promise.all([
          countEstabelecimentos(cpfUsuario),
          countFuncionarios(),
          countClientes(),
          countProdutos(),
          countServicos(),
          listarOrdensServico(),
          listarProdutos()
        ]);

        if (!isActive) return; // evita atualizar se o componente foi desmontado

        setTotals({
          estabelecimentos,
          funcionarios,
          clientes,
          produtos: produtosCount,
          servicos,
          ordens: ordensArr.length,
        });

        setOrdensAbertas(ordensArr.filter((os: OrdemServico) => os.status === 'Aberta'));

        const baixoEstoque: any[] = [];
        const pertoVencer: any[] = [];
        const vencidos: any[] = [];
        

        produtos.forEach((p: any) => {
          const estoqueRatio = p.estoqueMinimo > 0 ? p.qtdEstoque / p.estoqueMinimo : 1;
          const isLowStock = estoqueRatio <= 0.2;
          if (isLowStock) baixoEstoque.push(p);

          const { isVencido, isPertoVencimento } = getValidadeStatus(p.dataValidade);
          if (isVencido) vencidos.push(p);
          else if (isPertoVencimento) pertoVencer.push(p);
        });

        setProdutosBaixoEstoque(baixoEstoque);
        setProdutosPertoVencer(pertoVencer);
        setProdutosVencidos(vencidos);
      }
      fetchDashboardData();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <PaperProvider>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={globalStyles.container}>
          <Text style={globalStyles.title}>Visão geral do seu sistema de gestão</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24, marginBottom: 32 }}>
            {CARD_DATA.map(item => (
              <View key={item.key} style={globalStyles.cardWrapper}>
                <View style={[globalStyles.cardTopBorder, { backgroundColor: colors.primary }]} />
                <View style={globalStyles.cardDashboard}>
                  <View style={[globalStyles.iconContainerDashboard, { backgroundColor: item.color }]}>
                    <MaterialCommunityIcons name={item.icon} size={32} color="#fff" />
                  </View>
                  <Text style={globalStyles.countDashboard}>{totals[item.key as keyof typeof totals]}</Text>
                  <Text style={globalStyles.labelDashboard}>{item.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Card de Produtos com Estoque Baixo */}
          <View style={globalStyles.lowStockCard}>
            <View style={globalStyles.lowStockHeader}>
              <MaterialCommunityIcons name="alert-outline" size={26} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={globalStyles.lowStockTitle}>Produtos com Estoque Baixo</Text>
            </View>
            <View style={{ height: 16 }} />
            {produtosBaixoEstoque.length === 0 ? (
              <Text style={{ color: colors.primary, marginTop: 12, marginLeft: 8 }}>Nenhum produto com estoque baixo.</Text>
            ) : (
              produtosBaixoEstoque.map(produto => (
                <View key={produto.id} style={globalStyles.lowStockItem}>
                  <View>
                    <Text style={globalStyles.lowStockProductName}>{produto.nome}</Text>
                    <Text style={globalStyles.lowStockProductInfo}>Código: {produto.id}</Text>
                    <Text style={globalStyles.lowStockProductInfo}>Mín: {produto.estoqueMinimo}</Text>
                  </View>
                  <View style={globalStyles.lowStockQtdBox}>
                    <Text style={globalStyles.lowStockQtdText}>{produto.qtdEstoque} unidades</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Card de Produtos Perto de Vencer */}
          <View style={globalStyles.lowStockCard}>
            <View style={globalStyles.lowStockHeader}>
              <MaterialCommunityIcons name="calendar-alert-outline" size={26} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={globalStyles.lowStockTitle}>Produtos Perto de Vencer</Text>
            </View>
            <View style={{ height: 16 }} />
            {produtosPertoVencer.length === 0 ? (
              <Text style={{ color: colors.primary, marginTop: 12, marginLeft: 8 }}>Nenhum produto perto de vencer.</Text>
            ) : (
              produtosPertoVencer.map(produto => (
                <View key={produto.id} style={globalStyles.lowStockItem}>
                  <View>
                    <Text style={globalStyles.lowStockProductName}>{produto.nome}</Text>
                    <Text style={globalStyles.lowStockProductInfo}>Código: {produto.id}</Text>
                    <Text style={globalStyles.lowStockProductInfo}>Validade: {produto.validade}</Text>
                  </View>
                  <View style={globalStyles.lowStockQtdBox}>
                    <Text style={globalStyles.lowStockQtdText}>{formatDateBR(produto.dataValidade)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Card de Produtos Vencidos */}
          <View style={globalStyles.lowStockCard}>
            <View style={globalStyles.lowStockHeader}>
              <MaterialCommunityIcons name="calendar-remove-outline" size={26} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={globalStyles.lowStockTitle}>Produtos Vencidos</Text>
            </View>
            <View style={{ height: 16 }} />
            {produtosVencidos.length === 0 ? (
              <Text style={{ color: colors.primary, marginTop: 12, marginLeft: 8 }}>Nenhum produto vencido.</Text>
            ) : (
              produtosVencidos.map(produto => (
                <View key={produto.id} style={globalStyles.lowStockItem}>
                  <View>
                    <Text style={globalStyles.lowStockProductName}>{produto.nome}</Text>
                    <Text style={globalStyles.lowStockProductInfo}>Código: {produto.id}</Text>
                    <Text style={globalStyles.lowStockProductInfo}>Validade: {produto.validade}</Text>
                  </View>
                  <View style={globalStyles.lowStockQtdBox}>
                    <Text style={globalStyles.lowStockQtdText}>{formatDateBR(produto.dataValidade)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
          <View style={globalStyles.osCard}>
            <View style={globalStyles.osHeader}>
              <MaterialCommunityIcons name="file-document-outline" size={26} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={globalStyles.osTitle}>Ordens de Serviço Abertas</Text>
            </View>
            <View style={{ height: 16 }} />
            {ordensAbertas.length === 0 ? (
              <Text style={{ color: colors.primary, marginTop: 12, marginLeft: 8 }}>Nenhuma ordem aberta.</Text>
            ) : (
              ordensAbertas.map(ordem => (
                <View key={ordem.id} style={globalStyles.osItem}>
                  <View>
                    <Text style={globalStyles.osNumber}>OS #{ordem.numeroOS}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <MaterialCommunityIcons name="currency-usd" size={20} color="#27AE60" style={{ marginRight: 4 }} />
                      <Text style={globalStyles.osValue}>{formatMoney(ordem.valorTotal)}</Text>
                    </View>
                  </View>
                  <View style={globalStyles.osStatusBox}>
                    <Text style={globalStyles.osStatusText}>Aberta</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}