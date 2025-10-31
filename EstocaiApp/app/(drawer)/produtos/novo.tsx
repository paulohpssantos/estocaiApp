import { Produto } from "@/src/models/produto";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { cadastrarProduto } from '../../../src/services/produtoService';
import { formatDateBR, formatISODate, formatMoneyNoSymbol } from '../../../src/utils/formatters';

export default function NovoProduto() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [form, setForm] = useState<Produto>({
    id: null,
    nome: '',
    descricao: '',
    valor: 0,
    qtdEstoque: 0,
    estoqueMinimo: 0,
    dataFabricacao: '',
    dataValidade: '',
  });

  const [valorInput, setValorInput] = useState(formatMoneyNoSymbol(0));
  const [showDatePickerFab, setShowDatePickerFab] = useState(false);
  const [showDatePickerVal, setShowDatePickerVal] = useState(false);

  useEffect(() => {
    if (params.produto) {
      const prod = JSON.parse(params.produto as string);
      setForm(prod);
      setValorInput(formatMoneyNoSymbol(prod.valor));
    } else {
      setForm({
        id: null,
        nome: '',
        descricao: '',
        valor: 0,
        qtdEstoque: 0,
        estoqueMinimo: 0,
        dataFabricacao: '',
        dataValidade: '',
      });
      setValorInput(formatMoneyNoSymbol(0));
    }
  }, [params.produto]);

  const handleChange = (field: keyof Produto, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleValorChange = (v: string) => {
    const onlyNums = v.replace(/\D/g, '');
    const floatValue = Number(onlyNums) / 100;
    setValorInput(formatMoneyNoSymbol(floatValue));
    handleChange('valor', floatValue);
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...form,
        dataFabricacao: formatISODate(form.dataFabricacao),
        dataValidade: formatISODate(form.dataValidade),
      };
      await cadastrarProduto(dataToSend);
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      router.replace('/produtos');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar produto');
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
                placeholder="Código do Produto"
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
            placeholder="Descrição do Produto"
            value={form.descricao}
            onChangeText={v => handleChange('descricao', v)}
            style={globalStyles.input}
          />
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 4, color: colors.text }}>Valor</Text>
              <TextInput
                placeholder="Valor do Produto"
                value={valorInput}
                onChangeText={handleValorChange}
                style={globalStyles.input}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 4, color: colors.text }}>Estoque</Text>
              <TextInput
                placeholder="Quantidade em Estoque"
                value={form.qtdEstoque ? form.qtdEstoque.toString() : ''}
                onChangeText={v => handleChange('qtdEstoque', v === '' ? 0 : parseInt(v))}
                style={globalStyles.input}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 4, color: colors.text }}>Est. Mín.</Text>
              <TextInput
                placeholder="Estoque Mínimo"
                value={form.estoqueMinimo ? form.estoqueMinimo.toString() : ''}
                onChangeText={v => handleChange('estoqueMinimo', v === '' ? 0 : parseInt(v))}
                style={globalStyles.input}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={{ marginBottom: 4, color: colors.text }}>Data de Fabricação</Text>
          <TouchableOpacity onPress={() => setShowDatePickerFab(true)}>
            <TextInput
              placeholder="Data de Fabricação"
              value={form.dataFabricacao}
              style={globalStyles.input}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePickerFab && (
            <DateTimePicker
              value={form.dataFabricacao ? new Date(form.dataFabricacao.split('/').reverse().join('-')) : new Date()}
              mode="date"
              display="default"
              onChange={(event: any, date: Date | undefined) => {
                setShowDatePickerFab(false);
                if (date) {
                  const d = date.toISOString().slice(0, 10);
                  const formatted = formatDateBR(d);
                  handleChange('dataFabricacao', formatted);
                }
              }}
              maximumDate={new Date()}
            />
          )}
          <Text style={{ marginBottom: 4, color: colors.text }}>Data de Validade</Text>
          <TouchableOpacity onPress={() => setShowDatePickerVal(true)}>
            <TextInput
              placeholder="Data de Validade"
              value={form.dataValidade}
              style={globalStyles.input}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePickerVal && (
            <DateTimePicker
              value={form.dataValidade ? new Date(form.dataValidade.split('/').reverse().join('-')) : new Date()}
              mode="date"
              display="default"
              onChange={(event: any, date: Date | undefined) => {
                setShowDatePickerVal(false);
                if (date) {
                  const d = date.toISOString().slice(0, 10);
                  const formatted = formatDateBR(d);
                  handleChange('dataValidade', formatted);
                }
              }}
            />
          )}
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Button
          mode="outlined"
          onPress={() => router.replace('/produtos')} 
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