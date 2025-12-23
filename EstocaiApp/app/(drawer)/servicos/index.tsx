import { Usuario } from '@/src/models/usuario';
import { validaUsuarioExpirado } from '@/src/utils/functions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Provider as PaperProvider } from 'react-native-paper';
import colors from "../../../constants/colors";
import globalStyles from '../../../constants/globalStyles';
import { Servico } from '../../../src/models/servico';
import { cadastrarServico, listarServicos } from '../../../src/services/servicoService';
import { formatDurationHM, formatMoney } from '../../../src/utils/formatters';

export default function Estabelecimentos() {
  const router = useRouter();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const fetchServicos = async () => {
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
      const data = await listarServicos(usuario.cpf);
      setServicos(data);
    } catch (e) {
      setServicos([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        if (mounted) await fetchServicos();
      })();
      return () => { mounted = false; };
    }, [])
  );

  function renderCard(serv: Servico) {
    const handleDelete = () => {
      Alert.alert(
        'Confirmar exclusão',
        'Deseja realmente deletar este serviço?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Deletar',
            style: 'destructive',
            onPress: async () => {
              try {
                const atualizado = { ...serv, ativo: false };
                await cadastrarServico(atualizado);
                await fetchServicos();
              } catch (e) {
                Alert.alert('Erro', 'Não foi possível deletar o serviço.');
              }
            }
          }
        ]
      );
    };
    return (
      <Card style={{ marginBottom: 18, borderRadius: 18, backgroundColor: colors.background, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 10, backgroundColor: colors.accent }}>
          <View style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            padding: 12,
            marginRight: 14
          }}>
            <MaterialCommunityIcons
              name={"cog-outline"}
              size={32}
              color={colors.background}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 2 }}>{serv.nome}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ color: colors.secondary, fontWeight: '600', fontSize: 15, marginBottom: 2, borderColor: colors.border, borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>{serv.id}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            <IconButton
              icon="pencil-outline"
              size={22}
              onPress={() => router.push({ pathname: '/(drawer)/servicos/novo', params: { servico: JSON.stringify(serv) } })}
            />
            <IconButton icon="delete-outline" size={22} onPress={handleDelete} />
          </View>
        </View>
        <View style={{ borderTopWidth: 1, borderColor: '#f0f0f0', padding: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                <MaterialCommunityIcons name="cash" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: colors.darkGreen, fontWeight: '600', fontSize: 15, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
                  {formatMoney(serv.valor)}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={{
                  color: colors.secondary,
                  fontWeight: '600',
                  fontSize: 15,
                  marginBottom: 0,
                  borderColor: colors.border,
                  backgroundColor: colors.accent,
                  borderWidth: 1,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12
                }}>
                  {formatDurationHM(serv.duracao)}
                </Text>
              </View>
            </View>
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
            data={servicos}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => renderCard(item)}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>Nenhum serviço encontrado.</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push('/(drawer)/servicos/novo')}
          style={globalStyles.primaryButton}>
          Novo Serviço
        </Button>
      </View>
    </PaperProvider>
  );
}