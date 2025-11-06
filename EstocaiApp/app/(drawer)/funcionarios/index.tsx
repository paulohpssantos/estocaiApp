import { Funcionario } from '@/src/models/funcionario';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Provider as PaperProvider } from 'react-native-paper';
import colors from "../../../constants/colors";
import globalStyles from '../../../constants/globalStyles';
import { cadastrarFuncionario, listarFuncionarios } from '../../../src/services/funcionarioService';
import { formatCelular, formatCpfCnpj } from '../../../src/utils/formatters';

export default function Funcionarios() {
  const router = useRouter();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  

  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      const data = await listarFuncionarios();
      setFuncionarios(data);
    } catch (e) {
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        if (mounted) await fetchFuncionarios();
      })();
      return () => { mounted = false; };
    }, [])
  );


  function renderCard(func: Funcionario) {
    const handleDelete = () => {
      Alert.alert(
        'Confirmar exclusão',
        'Deseja realmente deletar este funcionário?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Deletar',
            style: 'destructive',
            onPress: async () => {
              try {
                const atualizado = { ...func, ativo: false };
                await cadastrarFuncionario(atualizado);
                await fetchFuncionarios(); 
              } catch (e) {
                Alert.alert('Erro', 'Não foi possível deletar o funcionário.');
              }
            }
          }
        ]
      );
    };
    return (
      <Card style={{ marginBottom: 18, borderRadius: 18, backgroundColor: colors.background, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 10 , backgroundColor: colors.accent}}>
          <View style={{ backgroundColor: colors.primary, borderRadius: 16, padding: 12, marginRight: 14 }}>
            <MaterialIcons name="people" size={32} color={colors.background} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 2 }}>{func.nome}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ color: colors.secondary, fontWeight: '600', fontSize: 15, marginBottom: 2, borderColor: colors.border, borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>{formatCpfCnpj(func.cpf)}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            <IconButton
              icon="pencil-outline"
              size={22}
              onPress={() => router.push({ pathname: '/(drawer)/funcionarios/novo', params: { funcionario: JSON.stringify(func) } })}
            />
            <IconButton icon="delete-outline" size={22} onPress={handleDelete} />
          </View>
        </View>
        <View style={{ borderTopWidth: 1, borderColor: '#f0f0f0', padding: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialCommunityIcons name="briefcase-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">{func.cargo}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialCommunityIcons name="phone-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15 }}>{formatCelular(func.telefone)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="email-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontSize: 15 }}>{func.email}</Text>
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
            data={funcionarios}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => renderCard(item)}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>Nenhum funcionário encontrado.</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
      <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push('/(drawer)/funcionarios/novo')}
          style={globalStyles.primaryButton}>
          Novo Funcionário
        </Button>
      </View>
    </PaperProvider>
  );
}
