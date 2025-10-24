import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { Estabelecimento } from '../../../src/models/estabelecimento';
import { Usuario } from '../../../src/models/usuario';
import { cadastrarEstabelecimento } from '../../../src/services/estabelecimentoService';
import { getEndereco } from '../../../src/services/viacepService';


export default function NovoEstabelecimento() {
  const router = useRouter();

  const [form, setForm] = useState<Estabelecimento>({
    cpfCnpj: '',
    nome: '',
    logradouro: '',
    cep: '',
    uf: '',
    municipio: '',
    telefone: '',
    email: '',
    usuario: null as any,
  });
  
  useEffect(() => {
    const loadUsuario = async () => {
      try {
        const usuarioString = await AsyncStorage.getItem("usuario");
        if (!usuarioString) return; 
        const usuario = JSON.parse(usuarioString) as Usuario;
        // assegura ao TS que usuario é um Usuario (não null) aqui
        setForm(prev => ({ ...prev, usuario: usuario as Usuario }));
      } catch (e) {
        console.warn('Erro ao carregar usuário do AsyncStorage', e);
      }
    };
    loadUsuario();
  }, []);

  const handleChange = (field: keyof Estabelecimento, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleUsuarioChange = (field: keyof Usuario, value: string) => {
    setForm(prev => ({ ...prev, usuario: { ...((prev.usuario as Usuario) || {}), [field]: value } }));
  };
  const handleSubmit = async () => {
    try {
      await cadastrarEstabelecimento(form);
      Alert.alert('Sucesso', 'Estabelecimento cadastrado com sucesso!');
      router.replace('/estabelecimentos');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar estabelecimento');
    }
  };

  return (
    <View style={[globalStyles.centeredContainer, { paddingTop: 20 }, { paddingBottom: 80 }]}> 
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={globalStyles.formContainer}>
          <TextInput
            placeholder="CNPJ/CPF"
            value={form.cpfCnpj}
            onChangeText={v => handleChange('cpfCnpj', v)}
            style={globalStyles.input}
          />
          <TextInput
            placeholder="Nome"
            value={form.nome}
            onChangeText={v => handleChange('nome', v)}
            style={globalStyles.input}
          />
          <TextInput
            placeholder="CEP"
            value={form.cep}
            onChangeText={async v => {
              handleChange('cep', v);
              if (v.length === 8) { 
                try {
                  const endereco = await getEndereco(v);
                  if (endereco && !endereco.erro) {
                    setForm(prev => ({
                      ...prev,
                      logradouro: endereco.logradouro || '',
                      uf: endereco.uf || '',
                      municipio: endereco.localidade || ''
                    }));
                  }
                } catch (e) {
                }
              }
            }}
            style={globalStyles.input}
          />
          <TextInput
            placeholder="Logradouro"
            value={form.logradouro}
            onChangeText={v => handleChange('logradouro', v)}
            style={globalStyles.input}
          />
          <TextInput
            placeholder="UF"
            value={form.uf}
            onChangeText={v => handleChange('uf', v)}
            style={globalStyles.input}
          />
          <TextInput
            placeholder="Município"
            value={form.municipio}
            onChangeText={v => handleChange('municipio', v)}
            style={globalStyles.input}
          />
          <TextInput
            placeholder="Telefone"
            value={form.telefone}
            onChangeText={v => handleChange('telefone', v)}
            style={globalStyles.input}
          />
          <TextInput
            placeholder="Email"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            style={globalStyles.input}
          />
          
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Button mode="outlined" onPress={() => {}} labelStyle={{ color: colors.primary }} style={[globalStyles.secondaryButton, { flex: 1 }]}>
          Cancelar
        </Button>
        <Button mode="contained" onPress={handleSubmit} style={[globalStyles.primaryButton, { flex: 1 }]}>
          Salvar
        </Button>
      </View>
    </View>
  );
}
