import { OrdemServico } from '@/src/models/ordemServico';
import { Produto } from '@/src/models/produto';
import { Usuario } from '@/src/models/usuario';
import { validaUsuarioExpirado } from '@/src/utils/functions';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Provider as PaperProvider } from 'react-native-paper';
import colors from "../../../constants/colors";
import globalStyles from '../../../constants/globalStyles';
import { deletarOrdemServico, listarOrdensServico, listarProdutosOrdemServico } from '../../../src/services/ordemServicoService';
import { formatDateBR, formatMoney } from '../../../src/utils/formatters';

export default function Ordens() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const produtosDaOrdem = async (idOrdemSelecionada: number): Promise<Produto[]> => {
    const produtosOrdem = await listarProdutosOrdemServico(idOrdemSelecionada);
    return produtosOrdem.map(pos => pos.produto);
  };

  const fetchOrdens = async () => {
    setLoading(true);
    try {
      const usuarioString = await AsyncStorage.getItem("usuario");
      if (!usuarioString) return;

      // redireciona para planos se o usuário estiver expirado
      try {
        if (validaUsuarioExpirado(usuarioString)) {
          setLoading(false);
          // replace evita voltar para a tela anterior
          router.replace('/(drawer)/planos');
          return;
        }
      } catch (e) {
        console.warn('[Clientes] validaUsuarioExpirado failed', e);
      }
      const usuario = JSON.parse(usuarioString) as Usuario;
      setUsuario(usuario);
      const data = await listarOrdensServico(usuario.cpf);
      setOrdens(data);
    } catch (e) {
      setOrdens([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        if (mounted) await fetchOrdens();
      })();
      return () => { mounted = false; };
    }, [])
  );


  function renderCard(ordem: OrdemServico) {
    const handleDelete = () => {
      Alert.alert(
        'Confirmar exclusão',
        'Deseja realmente deletar esta ordem de serviço?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Deletar',
            style: 'destructive',
            onPress: async () => {
              try {
                if (ordem.id != null) {

                  // 3. Deletar vínculos e ordem
                  //await deletarProdutosOrdemServicoPorOrdem(ordem.id);
                  //await deletarServicosOrdemServicoPorOrdem(ordem.id);
                  await deletarOrdemServico(ordem.id);
                  await fetchOrdens();
                }

              } catch (e) {
                Alert.alert('Erro', 'Não foi possível deletar a ordem de serviço.');
              }
            }
          }
        ]
      );
    };

    const statusBackgroundColors = {
      'Aberta': colors.backgroundYellow,
      'Em Andamento': colors.backgroundBlue,
      'Finalizada': colors.backgroundGreen,
      'Cancelada': colors.accent,
    };
    const statusBorderColors = {
      'Aberta': colors.yellowBorder,
      'Em Andamento': colors.blueBorder,
      'Finalizada': colors.greenBorder,
      'Cancelada': colors.border,
    };
    const statusFontColors = {
      'Aberta': colors.darkYellow,
      'Em Andamento': colors.darkBlue,
      'Finalizada': colors.darkGreen,
      'Cancelada': colors.secondary,
    };
    const statusBg = statusBackgroundColors[ordem.status as keyof typeof statusBackgroundColors] || '#EEE';
    const statusBorder = statusBorderColors[ordem.status as keyof typeof statusBorderColors] || '#EEE';
    const statusFont = statusFontColors[ordem.status as keyof typeof statusFontColors] || '#EEE';

    return (
      <Card style={{ marginBottom: 18, borderRadius: 18, backgroundColor: colors.background, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 10, backgroundColor: colors.accent }}>
          <View style={{ backgroundColor: colors.primary, borderRadius: 16, padding: 12, marginRight: 14 }}>
            <MaterialCommunityIcons name="file-document-outline" size={32} color={colors.background} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 0, lineHeight: 22 }}>OS</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 0, lineHeight: 22 }}>{ordem.numeroOS}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <IconButton
                  icon="eye-outline"
                  size={22}
                  onPress={() => router.push({ pathname: '/(drawer)/ordens/novo', params: { ordem: JSON.stringify(ordem), viewOnly: 'true' } })}
                />
                <IconButton
                  icon="pencil-outline"
                  size={22}
                  onPress={() => router.push({ pathname: '/(drawer)/ordens/novo', params: { ordem: JSON.stringify(ordem) } })}
                />
                <IconButton icon="delete-outline" size={22} onPress={handleDelete} />
              </View>
            </View>
            {/* Status em uma linha só, abaixo do header */}
            <TouchableOpacity activeOpacity={0.7} style={{ marginTop: 8 }}>
              <Text
                style={{
                  color: statusFont,
                  fontWeight: '600',
                  fontSize: 15,
                  borderColor: statusBorder,
                  borderWidth: 1,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 18,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: statusBg,
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                {ordem.status}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ borderTopWidth: 1, borderColor: '#f0f0f0', padding: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialIcons name="person-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15 }}>
              Cliente: <Text style={{ fontWeight: '600' }}>{ordem.cliente.nome}</Text>
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialIcons name="people" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15 }}>
              Funcionário: <Text style={{ fontWeight: '600' }}>{ordem.funcionario.nome}</Text>
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15 }}>Data:</Text>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{formatDateBR(ordem.dataAbertura)}</Text>
          </View>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginVertical: 12,
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="cash" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.text, fontSize: 15 }} numberOfLines={1} ellipsizeMode="tail">Total da Ordem:</Text>
            </View>
            <Text style={{
              color: colors.darkGreen,
              fontWeight: '600',
              fontSize: 15,
              backgroundColor: colors.backgroundGreen,
              borderColor: colors.greenBorder,
              borderWidth: 1,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
              marginLeft: 8,
              minWidth: 80,
              textAlign: 'right'
            }}>
              {formatMoney(ordem.valorTotal)}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <PaperProvider>
      <View style={globalStyles.container}>
        <View style={{ height: 18 }} />
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 30 }}>Carregando...</Text>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 80 }}
            data={ordens}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => renderCard(item)}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>Nenhuma ordem encontrada.</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push('/(drawer)/ordens/novo')}
          style={globalStyles.primaryButton}>
          Nova Ordem de Serviço
        </Button>
      </View>
    </PaperProvider>
  );
}
