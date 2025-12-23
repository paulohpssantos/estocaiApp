import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { Estabelecimento } from '../../../src/models/estabelecimento';
import { Usuario } from '../../../src/models/usuario';
import { cadastrarEstabelecimento } from '../../../src/services/estabelecimentoService';
import { getEndereco } from '../../../src/services/viacepService';


const initialForm: Estabelecimento = {
  cpfCnpj: '',
  nome: '',
  logradouro: '',
  cep: '',
  uf: '',
  municipio: '',
  telefone: '',
  email: '',
  usuario: null as any,
  ativo: true,
};

export default function NovoEstabelecimento() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [form, setForm] = useState<Estabelecimento>(initialForm);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      if (params.estabelecimento) {
        const est = JSON.parse(params.estabelecimento as string);
        setForm(est);
      } else {
        setForm(initialForm);
        const loadUsuario = async () => {
          try {
            const usuarioString = await AsyncStorage.getItem("usuario");
            if (!usuarioString) return;
            const usuario = JSON.parse(usuarioString) as Usuario;
            setForm(prev => ({ ...prev, usuario: usuario as Usuario }));
          } catch (e) {
            console.warn('Erro ao carregar usuário do AsyncStorage', e);
          }
        };
        loadUsuario();
      }
    }, [params.estabelecimento])
  );

  
  useEffect(() => {
    if (params.estabelecimento) {
      const est = JSON.parse(params.estabelecimento as string);
      setForm(est);
      navigation.setOptions?.({ title: 'Editar Estabelecimento' });
    } else {
      const loadUsuario = async () => {
        try {
          const usuarioString = await AsyncStorage.getItem("usuario");
          if (!usuarioString) return; 
          const usuario = JSON.parse(usuarioString) as Usuario;
          setForm(prev => ({ ...prev, usuario: usuario as Usuario }));
        } catch (e) {
          console.warn('Erro ao carregar usuário do AsyncStorage', e);
        }
      };
      loadUsuario();
      navigation.setOptions?.({ title: 'Novo Estabelecimento' });
    }  
    
  }, [params.estabelecimento]);

  const handleChange = (field: keyof Estabelecimento, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleUsuarioChange = (field: keyof Usuario, value: string) => {
    setForm(prev => ({ ...prev, usuario: { ...((prev.usuario as Usuario) || {}), [field]: value } }));
  };
  const handleSubmit = async () => {
    if (!form.cpfCnpj) {
      Alert.alert('Atenção', 'Informe o CPF/CNPJ do Estabelecimento.');
      return;
    }
    if (!form.nome) {
      Alert.alert('Atenção', 'Informe o nome do Estabelecimento.');
      return;
    }
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
          <Text style={{ marginBottom: 4, color: colors.text }}>CNPJ/CPF</Text>
          <TextInput
            placeholder="CNPJ/CPF"
            value={form.cpfCnpj}
            onChangeText={v => handleChange('cpfCnpj', v)}
            style={globalStyles.input}
            keyboardType="numeric"
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Nome</Text>
          <TextInput
            placeholder="Nome"
            value={form.nome}
            onChangeText={v => handleChange('nome', v)}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>CEP</Text>
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
                } catch (e) {}
              }
            }}
            style={globalStyles.input}
            keyboardType="numeric"
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Logradouro</Text>
          <TextInput
            placeholder="Logradouro"
            value={form.logradouro}
            onChangeText={v => handleChange('logradouro', v)}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>UF</Text>
          <TextInput
            placeholder="UF"
            value={form.uf}
            onChangeText={v => handleChange('uf', v)}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Município</Text>
          <TextInput
            placeholder="Município"
            value={form.municipio}
            onChangeText={v => handleChange('municipio', v)}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Telefone</Text>
          <TextInput
            placeholder="Telefone"
            value={form.telefone}
            onChangeText={v => handleChange('telefone', v)}
            style={globalStyles.input}
            keyboardType="numeric"
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Email</Text>
          <TextInput
            placeholder="Email"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            style={globalStyles.input}
          />
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Button
          mode="outlined"
          onPress={() => router.replace('/estabelecimentos')} 
          labelStyle={{ color: colors.primary }}
          style={[globalStyles.secondaryButton, { flex: 1 }]}
        >
          Cancelar
        </Button>
        <Button mode="contained" onPress={handleSubmit} style={[globalStyles.primaryButton, { flex: 1 }]}>
          Salvar
        </Button>
      </View>
    </View>
  );
}
