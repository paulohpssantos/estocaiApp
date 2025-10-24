import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Provider as PaperProvider } from 'react-native-paper';
import colors from "../../../constants/colors";
import globalStyles from '../../../constants/globalStyles';
import { Estabelecimento } from '../../../src/models/estabelecimento';
import { Usuario } from '../../../src/models/usuario';
import { listarEstabelecimentosPorCpf } from '../../../src/services/estabelecimentoService';
import { formatCelular, formatCpfCnpj } from '../../../src/utils/formatters';

export default function Estabelecimentos() {
  const router = useRouter();
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const loadUsuario = async () => {
      try {
        const usuarioString = await AsyncStorage.getItem("usuario");
        if (!usuarioString) return; 
        const usuario = JSON.parse(usuarioString) as Usuario;
        setUsuario(usuario);
      } catch (e) {
        console.warn('Erro ao carregar usuário do AsyncStorage', e);
      }
    };
    loadUsuario();
  }, []);

  useEffect(() => {
    if (!usuario) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listarEstabelecimentosPorCpf(usuario.cpf);
        if (mounted) setEstabelecimentos(data);
      } catch (e) {
        if (mounted) setEstabelecimentos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [usuario]);

  function renderCard(est: Estabelecimento) {
    return (
      <Card style={{ marginBottom: 18, borderRadius: 18, backgroundColor: colors.background, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 10 , backgroundColor: colors.accent}}>
          <View style={{ backgroundColor: colors.primary, borderRadius: 16, padding: 12, marginRight: 14 }}>
            <MaterialCommunityIcons name="office-building" size={32} color={colors.background} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 18, color: colors.text }}>{est.usuario?.nome}</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text, marginBottom: 2 }}>{est.nome}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ color: colors.secondary, fontWeight: '600', fontSize: 15, marginBottom: 2, borderColor: colors.border, borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>{formatCpfCnpj(est.cpfCnpj)}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            <IconButton icon="pencil-outline" size={22} onPress={() => {}} />
            <IconButton icon="delete-outline" size={22} onPress={() => {}} />
          </View>
        </View>
        <View style={{ borderTopWidth: 1, borderColor: '#f0f0f0', padding: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">{est.logradouro}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialCommunityIcons name="phone-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15 }}>{formatCelular(est.telefone)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="email-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15 }}>{est.email}</Text>
          </View>
        </View>
      </Card>
    );
  }

  // function formatCpfCnpj(value: string) {
  //   if (!value) return '';
  //   if (value.length === 14) {
  //     // CNPJ
  //     return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  //   } else if (value.length === 11) {
  //     // CPF
  //     return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  //   }
  //   return value;
  // }

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
            data={estabelecimentos}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => renderCard(item)}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>Nenhum estabelecimento encontrado.</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
      <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push('/(drawer)/estabelecimentos/novo')}
          style={globalStyles.primaryButton}>
          Novo Estabelecimento
        </Button>
      </View>
    </PaperProvider>
  );
}
