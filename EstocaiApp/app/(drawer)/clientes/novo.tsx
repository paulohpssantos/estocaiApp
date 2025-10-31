import { Cliente } from "@/src/models/cliente";
import { Usuario } from "@/src/models/usuario";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { Estabelecimento } from '../../../src/models/estabelecimento';
import { cadastrarCliente } from '../../../src/services/clienteService';
import { listarEstabelecimentosPorCpf } from '../../../src/services/estabelecimentoService';
import { getEndereco } from '../../../src/services/viacepService';


export default function NovoCliente() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Cliente>({
    cpf: '',
    nome: '',
    telefone: '',
    email: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cep: '',
    uf: '',
    municipio: '',
    dataNascimento: '',
    ativo: true,
    estabelecimento: null as any,
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
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field: keyof Cliente, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
 
  const handleSubmit = async () => {
    try {
      await cadastrarCliente(form);
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      router.replace('/clientes');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar cliente');
    }
  };
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
                      municipio: endereco.localidade || '',
                      bairro: endereco.bairro || ''
                    }));
                  }
                } catch (e) {}
              }
            }}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Logradouro</Text>
          <TextInput
            placeholder="Logradouro"
            value={form.logradouro}
            onChangeText={v => handleChange('logradouro', v)}
            style={globalStyles.input}
          />
          <Text style={{ marginBottom: 4, color: colors.text }}>Número</Text>
          <TextInput
            placeholder="Número"
            value={form.numero}
            onChangeText={v => handleChange('numero', v)}
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
          <Text style={{ marginBottom: 4, color: colors.text }}>Data de Nascimento</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              placeholder="Data de Nascimento"
              value={form.dataNascimento}
              style={globalStyles.input}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.dataNascimento ? new Date(form.dataNascimento) : new Date()}
              mode="date"
              display="default"
              onChange={(event: any, date: Date | undefined) => {
                setShowDatePicker(false);
                if (date) {
                  // Formata para yyyy-mm-dd
                  const d = date.toISOString().slice(0, 10);
                  handleChange('dataNascimento', d);
                }
              }}
              maximumDate={new Date()}
            />
          )}
          
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
