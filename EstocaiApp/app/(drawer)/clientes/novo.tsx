import { Cliente } from "@/src/models/cliente";
import { Usuario } from "@/src/models/usuario";
import { formatDateBR, formatISODate } from "@/src/utils/formatters";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { Estabelecimento } from '../../../src/models/estabelecimento';
import { cadastrarCliente } from '../../../src/services/clienteService';
import { listarEstabelecimentosPorCpf } from '../../../src/services/estabelecimentoService';
import { getEndereco } from '../../../src/services/viacepService';


const initialForm: Cliente = {
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
  usuario: null as any,
};

export default function NovoCliente() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Cliente>(initialForm);
  const navigation = useNavigation();
  const [estabelecimentoBusca, setEstabelecimentoBusca] = useState('');
  const [estabelecimentosFiltrados, setEstabelecimentosFiltrados] = useState<Estabelecimento[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (params.cliente) {
        const est = JSON.parse(params.cliente as string);
        setForm(est);
        setEstabelecimentoBusca(est.estabelecimento?.nome || '');
      } else {
        setForm(initialForm);
        setEstabelecimentoBusca('');
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
    }, [params.cliente])
  );

  useEffect(() => {
    if (estabelecimentoBusca.trim() === '') {
      setEstabelecimentosFiltrados([]);
    } else {
      setEstabelecimentosFiltrados(
        estabelecimentos.filter(e =>
          e.nome.toLowerCase().includes(estabelecimentoBusca.toLowerCase())
        )
      );
    }
  }, [estabelecimentoBusca, estabelecimentos]);

  
  useEffect(() => {
    if (params.cliente) {
      const cliente = JSON.parse(params.cliente as string) as Cliente;
      setForm({
        ...cliente,
        dataNascimento: cliente.dataNascimento ? formatDateBR(cliente.dataNascimento) : '',
        estabelecimento: cliente.estabelecimento || null,
      });
      setEstabelecimentoBusca(cliente.estabelecimento?.nome || '');
      navigation.setOptions?.({ title: 'Editar Cliente' });
    } else {
      setForm({
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
        usuario: null as any,
      });
      setEstabelecimentoBusca('');
      navigation.setOptions?.({ title: 'Novo Cliente' });
    }
  }, [params.cliente]);


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
    if (!form.nome) {
      Alert.alert('Atenção', 'Informe o nome do Cliente.');
      return;
    }
    if (!form.estabelecimento) {
      Alert.alert('Atenção', 'Informe o estabelecimento do Cliente.');
      return;
    }
    if (!form.telefone) {
      Alert.alert('Atenção', 'Informe o telefone do Cliente.');
      return;
    }
    try {
      const dataToSend = {
        ...form,
        dataNascimento: formatISODate(form.dataNascimento),

      };
      await cadastrarCliente(dataToSend);
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      router.replace('/clientes');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar cliente');
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[globalStyles.centeredContainer, { paddingTop: 20 }, { paddingBottom: 20 }]}>
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={globalStyles.formContainer}>
            <Text style={{ marginBottom: 4, color: colors.text }}>Estabelecimento</Text>
            <TextInput
              placeholder="Buscar estabelecimento"
              value={estabelecimentoBusca}
              onChangeText={v => {
                setEstabelecimentoBusca(v);
                setForm(prev => ({ ...prev, estabelecimento: null as any }));
              }}
              style={globalStyles.input}
              onFocus={() => {
                if (estabelecimentoBusca.trim() === '') setEstabelecimentosFiltrados(estabelecimentos);
              }}
              onBlur={() => {
                setTimeout(() => setEstabelecimentosFiltrados([]), 200);
              }}
            />
            {estabelecimentosFiltrados.length > 0 && (
              <View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 8, maxHeight: 200 }}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {estabelecimentosFiltrados.map(est => (
                    <TouchableOpacity
                      key={est.cpfCnpj}
                      onPress={() => {
                        Keyboard.dismiss();
                        setForm(prev => ({ ...prev, estabelecimento: est }));
                        setEstabelecimentoBusca(est.nome);
                        setEstabelecimentosFiltrados([]);
                      }}
                      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                    >
                      <Text style={{ color: colors.text }}>{est.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            { }
            <Text style={{ marginBottom: 4, color: colors.text }}>CPF</Text>
            <TextInput
              placeholder="CPF"
              value={form.cpf}
              onChangeText={v => handleChange('cpf', v)}
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
                  } catch (e) { }
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
                keyboardType="numeric"
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
                    const dia = String(date.getDate()).padStart(2, '0');
                    const mes = String(date.getMonth() + 1).padStart(2, '0');
                    const ano = date.getFullYear();
                    const formatted = `${dia}/${mes}/${ano}`;
                    handleChange('dataNascimento', formatted);
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
            onPress={() => router.replace('/clientes')}
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
    </KeyboardAvoidingView>
  );
}
