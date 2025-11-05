import { Cliente } from "@/src/models/cliente";
import { Estabelecimento } from "@/src/models/estabelecimento";
import { Funcionario } from "@/src/models/funcionario";
import { ProdutoOrdemServico } from "@/src/models/produtoOrdemServico";
import { ServicoOrdemServico } from "@/src/models/servicoOrdemServico";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../../../constants/colors';
import globalStyles from '../../../constants/globalStyles';
import { OrdemServico } from '../../../src/models/ordemServico';
import { Produto } from '../../../src/models/produto';
import { Servico } from '../../../src/models/servico';
import { Usuario } from '../../../src/models/usuario';

import { listarClientes } from "@/src/services/clienteService";
import { cadastrarOrdemServico, cadastrarProdutosOrdemServico, cadastrarServicoOrdemServico } from "@/src/services/ordemServicoService";
import { listarProdutos } from "@/src/services/produtoService";
import { listarServicos } from "@/src/services/servicoService";
import { formatDateBR, formatISODate, formatMoney, formatMoneyNoSymbol } from "@/src/utils/formatters";
import { listarEstabelecimentosPorCpf } from '../../../src/services/estabelecimentoService';
import { listarFuncionariosPorEstabelecimento } from '../../../src/services/funcionarioService';




export default function NovoFuncionario() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [funcionarios, setFuncionario] = useState<Funcionario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [clienteBusca, setClienteBusca] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [servicoBusca, setServicoBusca] = useState('');
  const [servicosFiltrados, setServicosFiltrados] = useState<Servico[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<{ servico: Servico, valor: number }[]>([]);
  const [produtoBusca, setProdutoBusca] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState<{ produto: Produto, quantidade: number }[]>([]);
  const [form, setForm] = useState<OrdemServico>({
    id: null,
    numeroOS: '',
    estabelecimento: null as any,
    funcionario: null as any,
    cliente: null as any,
    dataAbertura: '',
    observacoes: null,
    status: '',
    valorTotal: 0,
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

  const fetchFuncionarios = async (estabelecimentoCpfCnpj: string) => {
    setLoading(true);
    try {
      const data = await listarFuncionariosPorEstabelecimento(estabelecimentoCpfCnpj);
      setFuncionario(data);
    } catch (e) {
      setFuncionario([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const data = await listarClientes();
      setClientes(data);
    } catch (e) {
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const data = await listarProdutos();
      setProdutos(data);
    } catch (e) {
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicos = async () => {
    setLoading(true);
    try {
      const data = await listarServicos();
      setServicos(data);
    } catch (e) {
      setServicos([]);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    fetchEstabelecimentos();
    fetchProdutos();
    fetchServicos();
    fetchClientes();
  }, []);
  
  //filtra clientes
  useEffect(() => {
    if (clienteBusca.trim() === '') {
      setClientesFiltrados([]);
    } else {
      setClientesFiltrados(
        clientes.filter(c =>
          c.nome.toLowerCase().startsWith(clienteBusca.toLowerCase())
        )
      );
    }
  }, [clienteBusca, clientes]);

  //filtra serviços
  useEffect(() => {
    if (servicoBusca.trim() === '') {
      setServicosFiltrados([]);
    } else {
      setServicosFiltrados(
        servicos.filter(s =>
          s.nome.toLowerCase().includes(servicoBusca.toLowerCase())
        )
      );
    }
  }, [servicoBusca, servicos]);

  //filtra produtos
  useEffect(() => {
    if (produtoBusca.trim() === '') {
      setProdutosFiltrados([]);
    } else {
      setProdutosFiltrados(
        produtos.filter(p =>
          p.nome.toLowerCase().includes(produtoBusca.toLowerCase())
        )
      );
    }
  }, [produtoBusca, produtos]);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field: keyof OrdemServico, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
 
  const handleSubmit = async () => {
    try {
      
      // Monta o objeto da ordem de serviço
      const ordemServicoData: OrdemServico = {
        ...form,
        valorTotal: valorTotal,
        dataAbertura: formatISODate(form.dataAbertura),
        status: form.status && form.status.trim() !== '' ? form.status : 'Aberta',
      };

      // 1. Cadastra a ordem de serviço
      const ordemCriada = await cadastrarOrdemServico(ordemServicoData);

      // 2. Cadastra os produtos vinculados à ordem
      for (const item of produtosSelecionados) {
        const produtoOrdem: ProdutoOrdemServico = {
          id: null,
          ordemServico: ordemCriada,
          produto: item.produto,
          quantidade: item.quantidade,
          valorTotal: item.produto.valor,
        };
        await cadastrarProdutosOrdemServico(produtoOrdem);
      }

      // 3. Cadastra os serviços vinculados à ordem
      for (const item of servicosSelecionados) {
        const servicoOrdem: ServicoOrdemServico = {
          id: null,
          ordemServico: ordemCriada,
          servico: item.servico,
          valorTotal: item.valor,
        };
        await cadastrarServicoOrdemServico(servicoOrdem);
      }

      Alert.alert('Sucesso', 'Ordem de serviço cadastrada com sucesso!');
      router.replace('/ordens');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar ordem de serviço');
    }
  };

  const handleAddServico = (servico: Servico) => {
    setServicosSelecionados(prev => [
      ...prev,
      { servico, valor: servico.valor }
    ]);
    setServicoBusca('');
    setServicosFiltrados([]);
  };

  const handleValorServicoChange = (index: number, valor: string) => {
  const novoValor = Number(valor.replace(/\D/g, ''));
    setServicosSelecionados(prev => {
      const arr = [...prev];
      arr[index].valor = novoValor;
      return arr;
    });
  };

  const handleRemoveServico = (index: number) => {
    setServicosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProduto = (produto: Produto) => {
    setProdutosSelecionados(prev => [
      ...prev,
      { produto, quantidade: 1 }
    ]);
    setProdutoBusca('');
    setProdutosFiltrados([]);
  };

  const handleQuantidadeProdutoChange = (index: number, quantidade: string) => {
    const novaQtd = Number(quantidade.replace(/\D/g, ''));
    setProdutosSelecionados(prev => {
      const arr = [...prev];
      arr[index].quantidade = novaQtd;
      return arr;
    });
  };

  const handleRemoveProduto = (index: number) => {
    setProdutosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const calcularValorTotal = () => {
    const totalServicos = servicosSelecionados.reduce((sum, item) => sum + (item.valor || 0), 0);
    const totalProdutos = produtosSelecionados.reduce((sum, item) => sum + ((item.produto.valor || 0) * (item.quantidade || 0)), 0);
    return totalServicos + totalProdutos;
  };

  const valorTotal = calcularValorTotal();


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
                  fetchFuncionarios(est.cpfCnpj); // Chama ao selecionar
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

          <Text style={{ marginBottom: 4, color: colors.text }}>Funcionário</Text>
          <View style={[globalStyles.input, { justifyContent: 'center', height: 70, overflow: 'hidden' }]}>
            <Picker
              selectedValue={form.funcionario?.cpf || ''}
              onValueChange={(cpf: string) => {
                const func = funcionarios.find(f => f.cpf === cpf);
                if (func) {
                  setForm(prev => ({ ...prev, funcionario: func }));
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
              <Picker.Item label="Selecione o funcionário" value="" />
              {funcionarios.map(func => (
                <Picker.Item key={func.cpf} label={func.nome} value={func.cpf} />
              ))}
            </Picker>
          </View>

          <Text style={{ marginBottom: 4, color: colors.text }}>Cliente</Text>
            <TextInput
              placeholder="Buscar cliente"
              value={clienteBusca}
              onChangeText={setClienteBusca}
              style={globalStyles.input}
              onFocus={() => {
                if (clienteBusca.trim() === '') setClientesFiltrados(clientes);
              }}
              onBlur={() => {
                // Opcional: esconde a lista ao perder o foco
                 setClientesFiltrados([]);
              }}
            />
            {clientesFiltrados.length > 0 && (
              <View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
                {clientesFiltrados.map(cliente => (
                  <TouchableOpacity
                    key={cliente.cpf}
                    onPress={() => {
                      setForm(prev => ({ ...prev, cliente }));
                      setClienteBusca(cliente.nome);
                      setClientesFiltrados([]);
                    }}
                    style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  >
                    <Text style={{ color: colors.text }}>{cliente.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}  

          <Text style={{ marginBottom: 4, color: colors.text }}>Data de Abertura</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              placeholder="Data de Abertura"
              value={form.dataAbertura}
              style={globalStyles.input}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.dataAbertura ? new Date(form.dataAbertura) : new Date()}
              mode="date"
              display="default"
              onChange={(event: any, date: Date | undefined) => {
                setShowDatePicker(false);
                if (date) {
                  const d = date.toISOString().slice(0, 10);
                  const formatted = formatDateBR(d);
                  handleChange('dataAbertura', formatted);
                }
              }}
              maximumDate={new Date()}
            />
          )}
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginVertical: 12,
            }}
          />
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 8 }}>
            <MaterialCommunityIcons name="cog-outline" size={22} color={colors.primary} /> Serviços
          </Text>
          <TextInput
            placeholder="Buscar serviço"
            value={servicoBusca}
            onChangeText={setServicoBusca}
            style={globalStyles.input}
            onFocus={() => {
              if (servicoBusca.trim() === '') setServicosFiltrados(servicos);
            }}
            onBlur={() => {
              // Opcional: esconde a lista ao perder o foco
               setServicosFiltrados([]);
            }}
          />
          {servicosFiltrados.length > 0 && (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
              {servicosFiltrados.map(servico => (
                <TouchableOpacity
                  key={servico.id}
                  onPress={() => handleAddServico(servico)}
                  style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text style={{ color: colors.text }}>{servico.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {servicosSelecionados.length > 0 && (
            <View style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              marginTop: 12,
              backgroundColor: '#fff',
              padding: 8,
            }}>
              <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ flex: 2, color: colors.text, fontWeight: '600' }}>Serviço</Text>
                <Text style={{ flex: 1, color: colors.text, fontWeight: '600' }}>Valor</Text>
                <View style={{ width: 32 }} />
              </View>
              {servicosSelecionados.map((item, idx) => (
                <View key={item.servico.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ flex: 2, color: colors.text }}>{item.servico.nome}</Text>
                  <TextInput
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      backgroundColor: '#fafafa',
                      textAlign: 'center',
                    }}
                    value={item.valor === 0 ? '' : formatMoneyNoSymbol(item.valor)}
                    onChangeText={v => {
                      // Aceita apenas números, vírgula e ponto
                      const clean = v.replace(/[^0-9.,]/g, '').replace(',', '.');
                      const numeric = parseFloat(clean);
                      handleValorServicoChange(idx, isNaN(numeric) ? '0' : numeric.toString());
                    }}
                    keyboardType="numeric"
                    placeholder="0,00"
                  />
                  <TouchableOpacity onPress={() => handleRemoveServico(idx)} style={{ marginLeft: 8 }}>
                    <MaterialCommunityIcons name="delete-outline" size={22} color="#B3261E" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 8 }}>
            <MaterialCommunityIcons name="cube-outline" size={22} color={colors.primary} /> Produtos
          </Text>
          <TextInput
            placeholder="Buscar produto"
            value={produtoBusca}
            onChangeText={setProdutoBusca}
            style={globalStyles.input}
            onFocus={() => {
              if (produtoBusca.trim() === '') setProdutosFiltrados(produtos);
            }}
            onBlur={() => {
              // Opcional: esconde a lista ao perder o foco
               setProdutosFiltrados([]);
            }}
          />
          {produtosFiltrados.length > 0 && (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
              {produtosFiltrados.map(produto => (
                <TouchableOpacity
                  key={produto.id}
                  onPress={() => handleAddProduto(produto)}
                  style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text style={{ color: colors.text }}>{produto.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {produtosSelecionados.length > 0 && (
            <View style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              marginTop: 12,
              backgroundColor: '#fff',
              padding: 8,
            }}>
              <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ flex: 2, color: colors.text, fontWeight: '600' }}>Produto</Text>
                <Text style={{ flex: 1, color: colors.text, fontWeight: '600', textAlign: 'center' }}>Qtd</Text>
                <Text style={{ flex: 1, color: colors.text, fontWeight: '600', textAlign: 'center' }}>Valor Unit.</Text>
                <Text style={{ flex: 1, color: colors.text, fontWeight: '600', textAlign: 'center' }}>Total</Text>
                <View style={{ width: 32 }} />
              </View>
              {produtosSelecionados.map((item, idx) => (
                <View key={item.produto.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ flex: 2, color: colors.text }}>{item.produto.nome}</Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      backgroundColor: '#fafafa',
                      marginHorizontal: 4,
                      height: 40,
                      justifyContent: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleQuantidadeProdutoChange(idx, String(Math.max(1, item.quantidade - 1)))}
                      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    >
                      <MaterialCommunityIcons name="chevron-down" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={{ minWidth: 24, textAlign: 'center', fontSize: 16 }}>{item.quantidade}</Text>
                    <TouchableOpacity
                      onPress={() => handleQuantidadeProdutoChange(idx, String(item.quantidade + 1))}
                      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    >
                      <MaterialCommunityIcons name="chevron-up" size={22} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ flex: 1, color: colors.text, textAlign: 'center' }}>
                    {formatMoney(item.produto.valor)}
                  </Text>
                  <Text style={{ flex: 1, color: colors.text, textAlign: 'center' }}>
                    {formatMoney(item.produto.valor * item.quantidade)}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveProduto(idx)} style={{ marginLeft: 8 }}>
                    <MaterialCommunityIcons name="delete-outline" size={22} color="#B3261E" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginVertical: 12,
            }}
          />

          <Text style={{ marginBottom: 4, color: colors.text, fontWeight: 'bold', fontSize: 18 }}>Observações</Text>
          <TextInput
            placeholder="Observações da ordem de serviço"
            value={form.observacoes ?? ''}
            onChangeText={v => setForm(prev => ({ ...prev, observacoes: v }))}
            style={[globalStyles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            multiline
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(240,255,240,0.7)',
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#D1E7DD',
              padding: 18,
              marginBottom: 18,
              marginTop: 18,
            }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#2D3748' }}>Valor Total:</Text>
            <View
              style={{
                backgroundColor: 'rgba(209,231,221,0.7)',
                borderRadius: 30,
                paddingVertical: 8,
                paddingHorizontal: 24,
                minWidth: 120,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#256029' }}>
                {`R$ ${valorTotal.toFixed(2)}`}
              </Text>
            </View>
          </View>
 
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Button
          mode="outlined"
          onPress={() => router.replace('/ordens')} 
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
