import { Funcionario } from "@/src/models/funcionario";
import { Usuario } from "@/src/models/usuario";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { Estabelecimento } from '../../../src/models/estabelecimento';
import { listarEstabelecimentosPorCpf } from '../../../src/services/estabelecimentoService';
import { cadastrarFuncionario } from '../../../src/services/funcionarioService';

const initialForm: Funcionario = {
  cpf: '',
  nome: '',
  cargo: '',
  telefone: '',
  email: '',
  estabelecimento: null as any,
  ativo: true,
  usuario: null as any,
};

export default function NovoFuncionario() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Funcionario>(initialForm);
  const [estabelecimentoBusca, setEstabelecimentoBusca] = useState('');
  const [estabelecimentosFiltrados, setEstabelecimentosFiltrados] = useState<Estabelecimento[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUsuario = async () => {
      try {
        const usuarioString = await AsyncStorage.getItem("usuario");
        if (!usuarioString) return;
        const usuario = JSON.parse(usuarioString) as Usuario;
        setUsuario(usuario);
        setForm(prev => ({ ...prev, usuario }));
      } catch (e) {
        console.warn('Erro ao carregar usuário do AsyncStorage', e);
      }
    };
    loadUsuario();
  }, []);

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

  useFocusEffect(
    useCallback(() => {
      if (params.funcionario) {
        const funcionario = JSON.parse(params.funcionario as string) as Funcionario;
        setForm(funcionario);
        setEstabelecimentoBusca(funcionario.estabelecimento?.nome || '');
        navigation.setOptions?.({ title: 'Editar Funcionário' });
      } else {
        setForm(initialForm);
        setEstabelecimentoBusca('');
        navigation.setOptions?.({ title: 'Novo Funcionário' });
      }
    }, [params.funcionario])
  );

  const handleChange = (field: keyof Funcionario, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.cpf) {
      Alert.alert('Atenção', 'Informe o CPF do Funcionário.');
      return;
    }
    if (!form.cargo) {
      Alert.alert('Atenção', 'Informe o cargo do Funcionário.');
      return;
    }
    if (!form.nome) {
      Alert.alert('Atenção', 'Informe o nome do Funcionário.');
      return;
    }
    if (!form.estabelecimento) {
      Alert.alert('Atenção', 'Informe o estabelecimento do Funcionário.');
      return;
    }
    
    try {
      await cadastrarFuncionario(form);
      Alert.alert('Sucesso', 'Funcionário cadastrado com sucesso!');
      router.replace('/funcionarios');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar funcionário');
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
    </KeyboardAvoidingView>
  );
}