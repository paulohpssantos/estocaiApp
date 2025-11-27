import { Servico } from "@/src/models/servico";
import { Usuario } from "@/src/models/usuario";
import { cadastrarServico } from "@/src/services/servicoService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { formatMoneyNoSymbol } from '../../../src/utils/formatters';

const initialForm: Servico = {
  id: null,
  nome: '',
  descricao: '',
  valor: 0,
  duracao: '',
  ativo: true,
  usuario: null as any,
}

export default function NovoServico() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [form, setForm] = useState<Servico>(initialForm);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [valorInput, setValorInput] = useState(formatMoneyNoSymbol(0));
  const [duracaoInput, setDuracaoInput] = useState('00:00');

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

  useFocusEffect(
    React.useCallback(() => {
      if (!params.servico) {
        setForm(prev => ({
        ...initialForm,
          usuario: prev.usuario // mantém o usuário já carregado
        }));
        setValorInput(formatMoneyNoSymbol(0));
        setDuracaoInput('00:00');
      }
    }, [params.servico])
  );

  useEffect(() => {
    if (params.servico) {
      const serv = JSON.parse(params.servico as string);
      setForm(serv);
      setValorInput(formatMoneyNoSymbol(serv.valor));
      setDuracaoInput(serv.duracao);
      
    } else {
      setForm({
        id: null,
        nome: '',
        descricao: '',
        valor: 0,
        duracao: '',
        ativo: true,
        usuario: null as any,
      });
      setValorInput(formatMoneyNoSymbol(0));
      setDuracaoInput('00:00');
    }
  }, [params.servico]);

  const handleChange = (field: keyof Servico, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleValorChange = (v: string) => {
    const onlyNums = v.replace(/\D/g, '');
    const floatValue = Number(onlyNums) / 100;
    setValorInput(formatMoneyNoSymbol(floatValue));
    handleChange('valor', floatValue);
  };

  const handleDuracaoChange = (v: string) => {
    const onlyNums = v.replace(/\D/g, '');
    let formatted = onlyNums;

    if (onlyNums.length > 2) {
      formatted = onlyNums.slice(0, 2) + ':' + onlyNums.slice(2, 4);
    }
    // Limita a 5 caracteres (hh:mm)
    formatted = formatted.slice(0, 5);

    setDuracaoInput(formatted);
    handleChange('duracao', formatted);
  };

  const handleSubmit = async () => {
    if (!form.nome) {
      Alert.alert('Atenção', 'Informe o nome do Serviço.');
      return;
    }
    try {
      await cadastrarServico(form);
      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!');
      router.replace('/servicos');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar serviço');
    }
  };

  return (
    <View style={[globalStyles.centeredContainer, { paddingTop: 20 }, { paddingBottom: 80 }]}> 
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={globalStyles.formContainer}>
          {form.id !== null && (
            <>
              <Text style={{ marginBottom: 4, color: colors.text }}>Código</Text>
              <TextInput
                placeholder="Código do Serviço"
                value={form.id !== null ? form.id.toString() : ''}
                onChangeText={v => handleChange('id', parseInt(v))}
                style={globalStyles.input}
                editable={false}
              />
            </>
          )}
          <Text style={{ marginBottom: 4, color: colors.text }}>Nome</Text>
          <TextInput
            placeholder="Nome"
            value={form.nome}
            onChangeText={v => handleChange('nome', v)}
            style={globalStyles.input}
          />

          <Text style={{ marginBottom: 4, color: colors.text }}>Descrição</Text>
          <TextInput
            placeholder="Descrição do Serviço"
            value={form.descricao}
            onChangeText={v => handleChange('descricao', v)}
            style={globalStyles.input}
          />
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 4, color: colors.text }}>Valor</Text>
              <TextInput
                placeholder="Valor do Serviço"
                value={valorInput}
                onChangeText={handleValorChange}
                style={globalStyles.input}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 4, color: colors.text }}>Duração</Text>
              <TextInput
                placeholder="Duração do Serviço"
                value={duracaoInput}
                onChangeText={handleDuracaoChange}
                style={globalStyles.input}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Button
          mode="outlined"
          onPress={() => router.replace('/servicos')} 
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