import { Usuario } from '@/src/models/usuario';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Provider as PaperProvider } from 'react-native-paper';
import colors from "../../../constants/colors";
import globalStyles from '../../../constants/globalStyles';
import { Produto } from '../../../src/models/produto';
import { listarProdutos } from '../../../src/services/produtoService';
import { formatMoney } from '../../../src/utils/formatters';
import { isExpired, isNearExpiration, validaUsuarioExpirado, verifyIsLowStock } from '../../../src/utils/functions';

export default function Estabelecimentos() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const fetchProdutos = async () => {
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
      const data = await listarProdutos(usuario.cpf);
      setProdutos(data);
    } catch (e) {
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        if (mounted) await fetchProdutos();
      })();
      return () => { mounted = false; };
    }, [])
  );

  function renderCard(prod: Produto) {
    const isLowStock = verifyIsLowStock(prod.qtdEstoque, prod.estoqueMinimo);

    //Verifica data de vencimento
    const parseDate = (str: string) => {
      if (!str) return null;
      // Aceita tanto aaaa-mm-dd quanto aaaa/mm/dd
      const clean = str.replace(/\//g, '-');
      const [ano, mes, dia] = clean.split('-');
      return new Date(Number(ano), Number(mes) - 1, Number(dia));
    };


    let isVencido = isExpired(prod.dataValidade);
    let isPertoVencimento = isNearExpiration(prod.dataValidade);


    return (
      <Card style={{ marginBottom: 18, borderRadius: 18, backgroundColor: colors.background, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 10, backgroundColor: colors.accent }}>
          <View style={{
            backgroundColor: isLowStock || isVencido || isPertoVencimento ? colors.primary : colors.green,
            borderRadius: 16,
            padding: 12,
            marginRight: 14
          }}>
            <MaterialCommunityIcons
              name={isLowStock || isVencido || isPertoVencimento ? "alert-outline" : "cube-outline"}
              size={32}
              color={colors.background}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 2 }}>{prod.nome}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ color: colors.secondary, fontWeight: '600', fontSize: 15, marginBottom: 2, borderColor: colors.border, borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>{prod.id}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            <IconButton
              icon="pencil-outline"
              size={22}
              onPress={() => router.push({ pathname: '/(drawer)/produtos/novo', params: { produto: JSON.stringify(prod) } })}
            />
          </View>
        </View>
        <View style={{ borderTopWidth: 1, borderColor: '#f0f0f0', padding: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                <MaterialCommunityIcons name="cash" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: colors.darkGreen, fontWeight: '600', fontSize: 15, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
                  {formatMoney(prod.valor)}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                <MaterialCommunityIcons name="cube-scan" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={{
                  color: isLowStock ? colors.background : colors.darkGreen,
                  fontWeight: '600',
                  fontSize: 15,
                  marginBottom: 0,
                  backgroundColor: isLowStock ? colors.primary : colors.backgroundGreen,
                  borderColor: isLowStock ? colors.primary : colors.greenBorder,
                  borderWidth: 1,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12
                }}>
                  {`${prod.qtdEstoque}/${prod.estoqueMinimo}`}
                </Text>
              </View>
            </View>
          </View>
          {isLowStock && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.accent,
                borderRadius: 14,
                padding: 12,
                marginTop: 6,
                marginHorizontal: 6,
                gap: 8,
              }}
            >
              <MaterialCommunityIcons name="alert-outline" size={22} color="#B3261E" />
              <Text style={{ color: '#B3261E', fontWeight: '600', fontSize: 16 }}>Estoque baixo</Text>
            </View>
          )}

          {isVencido && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: '#FFF0F0',
                borderRadius: 14,
                padding: 12,
                marginTop: 6,
                marginHorizontal: 6,
                gap: 8,
              }}
            >
              <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#B3261E" />
              <Text style={{ color: '#B3261E', fontWeight: '600', fontSize: 16 }}>Produto vencido</Text>
            </View>
          )}

          {!isVencido && isPertoVencimento && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#F2B8B5',
                backgroundColor: '#FFF8F0',
                borderRadius: 14,
                padding: 12,
                marginTop: 6,
                marginHorizontal: 6,
                gap: 8,
              }}
            >
              <MaterialCommunityIcons name="clock-alert-outline" size={22} color="#B3261E" />
              <Text style={{ color: '#B3261E', fontWeight: '600', fontSize: 16 }}>Vencimento próximo</Text>
            </View>
          )}
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
            data={produtos}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => renderCard(item)}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>Nenhum produto encontrado.</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push('/(drawer)/produtos/novo')}
          style={globalStyles.primaryButton}>
          Novo Produto
        </Button>
      </View>
    </PaperProvider>
  );
}