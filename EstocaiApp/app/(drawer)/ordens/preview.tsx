import { Funcionario } from "@/src/models/funcionario";
import { Usuario } from "@/src/models/usuario";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { Estabelecimento } from '../../../src/models/estabelecimento';
import { listarEstabelecimentosPorCpf } from '../../../src/services/estabelecimentoService';
import { cadastrarFuncionario } from '../../../src/services/funcionarioService';


export default function NovoFuncionario() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Funcionario>({
    cpf: '',
    nome: '',
    cargo: '',
    telefone: '',
    email: '',
    estabelecimento: null as any,
    ativo: true,
  });


  const fetchEstabelecimentos = async () => {
    setLoading(true);
    try {
      const usuarioString = await AsyncStorage.getItem("usuario");
      if (!usuarioString) return;
      const usuario = JSON.parse(usuarioString) as Usuario;
      setUsuario(usuario);
      const data = await listarEstabelecimentosPorCpf(usuario.cpf);
      setEstabelecimentos(data);
    } catch (e) {
      setEstabelecimentos([]);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    fetchEstabelecimentos();
  }, []);
  
  

  const handleChange = (field: keyof Funcionario, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
 
  const handleSubmit = async () => {
    try {
      await cadastrarFuncionario(form);
      Alert.alert('Sucesso', 'Funcionário cadastrado com sucesso!');
      router.replace('/funcionarios');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar funcionário');
    }
  };

  const labelStyle = { marginBottom: 6, color: '#222', fontWeight: "600" };

  return (
    <View style={[globalStyles.centeredContainer, { paddingTop: 20 }, { paddingBottom: 20 }]}> 
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={globalStyles.formContainer}>

          <Text style={{ marginBottom: 4, color: colors.text }}>Estabelecimento</Text>
          <View style={[globalStyles.input, { justifyContent: 'center', height: 70, overflow: 'hidden' }]}>
            <Picker
              selectedValue={form.estabelecimento?.cpfCnpj || ''}
              onValueChange={(cpfCnpj: string) => {
                const est = estabelecimentos.find(e => e.cpfCnpj === cpfCnpj);
                if (est) {
                  setForm(prev => ({ ...prev, estabelecimento: est }));
                }
              }}
              style={{
                color: colors.text,
                fontSize: 16,
                backgroundColor: 'transparent', 
                width: '100%',
              }}
              dropdownIconColor={colors.primary}
            >
              <Picker.Item label="Selecione o estabelecimento" value="" />
              {estabelecimentos.map(est => (
                <Picker.Item key={est.cpfCnpj} label={est.nome} value={est.cpfCnpj} />
              ))}
            </Picker>
          </View>
          <Text style={{ marginBottom: 4, color: colors.text }}>CPF</Text>
          <TextInput
            placeholder="CPF"
            value={form.cpf}
            onChangeText={v => handleChange('cpf', v)}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Nome</Text>
          <TextInput
            placeholder="Nome"
            value={form.nome}
            onChangeText={v => handleChange('nome', v)}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Cargo</Text>
          <TextInput
            placeholder="Cargo"
            value={form.cargo}
            onChangeText={v => handleChange('cargo', v)}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Telefone</Text>
          <TextInput
            placeholder="Telefone"
            value={form.telefone}
            onChangeText={v => handleChange('telefone', v)}
            style={globalStyles.input}
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
          onPress={() => router.replace('/funcionarios')} 
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
