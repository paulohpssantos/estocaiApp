import { Cliente } from "@/src/models/cliente";
import { Estabelecimento } from "@/src/models/estabelecimento";
import { Funcionario } from "@/src/models/funcionario";
import { ProdutoOrdemServico } from "@/src/models/produtoOrdemServico";
import { ServicoOrdemServico } from "@/src/models/servicoOrdemServico";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { cadastrarOrdemServico, cadastrarProdutosOrdemServico, cadastrarServicoOrdemServico, listarProdutosOrdemServico, listarServicosOrdemServico } from "@/src/services/ordemServicoService";
import { listarProdutos } from "@/src/services/produtoService";
import { listarServicos } from "@/src/services/servicoService";
import { formatDateBR, formatISODate, formatMoney } from "@/src/utils/formatters";
import { listarEstabelecimentosPorCpf } from '../../../src/services/estabelecimentoService';
import { listarFuncionariosPorEstabelecimento } from '../../../src/services/funcionarioService';

export default function NovaOrdemServico() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [funcionarios, setFuncionario] = useState<Funcionario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const statusOptions = ["Aberta", "Em Andamento", "Finalizada", "Cancelada"];
  const [statusBusca, setStatusBusca] = useState('');
  const [statusFiltrados, setStatusFiltrados] = useState<string[]>([]);
  const [estabelecimentoBusca, setEstabelecimentoBusca] = useState('');
  const [estabelecimentosFiltrados, setEstabelecimentosFiltrados] = useState<Estabelecimento[]>([]);
  const [funcionarioBusca, setFuncionarioBusca] = useState('');
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState<Funcionario[]>([]);
  const [clienteBusca, setClienteBusca] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [servicoBusca, setServicoBusca] = useState('');
  const [servicosFiltrados, setServicosFiltrados] = useState<Servico[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<{ id?: number,servico: Servico, valor: number }[]>([]);
  const [produtoBusca, setProdutoBusca] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState<{ id?: number, produto: Produto, quantidade: number }[]>([]);
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
    const carregarDadosEdicao = async () => {
      if (params.ordem) {
        try {
          const ordem = JSON.parse(params.ordem as string);

          // 1. Buscar funcionários do estabelecimento da ordem
          if (ordem.estabelecimento?.cpfCnpj) {
            await fetchFuncionarios(ordem.estabelecimento.cpfCnpj);
          }

          // 2. Preencher o formulário
          setForm({
            ...ordem,
            dataAbertura: ordem.dataAbertura ? formatDateBR(ordem.dataAbertura) : '',
          });
          setClienteBusca(ordem.cliente?.nome || '');

          // 3. Buscar produtos e serviços vinculados à ordem
          if (ordem.id) {
            const produtosOrdem = await listarProdutosOrdemServico(ordem.id);
            setProdutosSelecionados(
              produtosOrdem.map((p: any) => ({
                id: p.id,
                produto: p.produto,
                quantidade: p.quantidade,
              }))
            );
            const servicosOrdem = await listarServicosOrdemServico(ordem.id);
            setServicosSelecionados(
              servicosOrdem.map((s: any) => ({
                id: s.id,
                servico: s.servico,
                valor: s.valorTotal,
              }))
            );
          }
        } catch (e) {
          // Se der erro, não faz nada
        }
      }
    };
    carregarDadosEdicao();
  }, [params.ordem]);

  // Limpa o formulário ao abrir para nova ordem
  useEffect(() => {
    if (!params.ordem) {
      setForm({
        id: null,
        numeroOS: '',
        estabelecimento: null as any,
        funcionario: null as any,
        cliente: null as any,
        dataAbertura: formatDateBR(new Date().toISOString().slice(0, 10)),
        observacoes: null,
        status: '',
        valorTotal: 0,
      });
      setStatusBusca('');
      setEstabelecimentoBusca('');
      setFuncionarioBusca('');
      setClienteBusca('');
      setServicoBusca('');
      setProdutoBusca('');
      setServicosSelecionados([]);
      setProdutosSelecionados([]);
      setStatusFiltrados([]);
      setEstabelecimentosFiltrados([]);
      setFuncionariosFiltrados([]);
      setClientesFiltrados([]);
      setServicosFiltrados([]);
      setProdutosFiltrados([]);
    }
  }, [params.ordem]);

  useEffect(() => {
    fetchEstabelecimentos();
    fetchProdutos();
    fetchServicos();
    fetchClientes();
  }, []);

  //Filtra status
  useEffect(() => {
    if (statusBusca.trim() === '') {
      setStatusFiltrados([]);
    } else {
      setStatusFiltrados(
        statusOptions.filter(s =>
          s.toLowerCase().includes(statusBusca.toLowerCase())
        )
      );
    }
  }, [statusBusca]);

  //Filtra estabelecimentos
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

  //Filtra funcionarios
  useEffect(() => {
    if (funcionarioBusca.trim() === '') {
      setFuncionariosFiltrados([]);
    } else {
      setFuncionariosFiltrados(
        funcionarios.filter(f =>
          f.nome.toLowerCase().includes(funcionarioBusca.toLowerCase())
        )
      );
    }
  }, [funcionarioBusca, funcionarios]);
  
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
      const ordemServicoData: OrdemServico = {
        ...form,
        valorTotal: valorTotal,
        dataAbertura: formatISODate(form.dataAbertura),
        status: form.status && form.status.trim() !== '' ? form.status : 'Aberta',
      };

      const ordemCriada = await cadastrarOrdemServico(ordemServicoData);

      for (const item of produtosSelecionados) {
        const produtoOrdem: ProdutoOrdemServico = {
          id: item.id ?? null,
          ordemServico: ordemCriada,
          produto: item.produto,
          quantidade: item.quantidade,
          valorTotal: item.produto.valor,
        };
        await cadastrarProdutosOrdemServico(produtoOrdem);
      }

      for (const item of servicosSelecionados) {
        const servicoOrdem: ServicoOrdemServico = {
          id: item.id ?? null,
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
      { id: undefined, servico, valor: servico.valor }
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
      { id: undefined, produto, quantidade: 1 }
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
  const isEditing = !!form.id;
  const isViewOnly = params.viewOnly === 'true';

  return (
    <View style={[globalStyles.centeredContainer, { paddingTop: 20 }, { paddingBottom: 20 }]}> 
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={globalStyles.formContainer}>

          {isEditing && (
            <>
              <Text style={{ marginBottom: 4, color: colors.text }}>Status</Text>
              <TextInput
                placeholder="Buscar status"
                value={statusBusca || form.status || ''}
                onChangeText={v => {
                  setStatusBusca(v);
                  setForm(prev => ({ ...prev, status: '' }));
                }}
                style={globalStyles.input}
                onFocus={() => {
                  if (statusBusca.trim() === '') setStatusFiltrados(statusOptions);
                }}
                onBlur={() => {
                  setTimeout(() => setStatusFiltrados([]), 200); // delay para permitir clique
                }}
                editable={!isViewOnly}
              />
              {statusFiltrados.length > 0 && !isViewOnly && (
                <View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
                  {statusFiltrados.map(status => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => {
                        setForm(prev => ({ ...prev, status }));
                        setStatusBusca(status);
                        setStatusFiltrados([]);
                      }}
                      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                    >
                      <Text style={{ color: colors.text }}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          <Text style={{ marginBottom: 4, color: colors.text }}>Estabelecimento</Text>
          <TextInput
            placeholder="Buscar estabelecimento"
            value={estabelecimentoBusca || form.estabelecimento?.nome || ''}
            onChangeText={v => {
              setEstabelecimentoBusca(v);
              setForm(prev => ({ ...prev, estabelecimento: null as any, funcionario: null as any }));
              setFuncionarioBusca('');
              setFuncionariosFiltrados([]);
            }}
            style={globalStyles.input}
            onFocus={() => {
              if (estabelecimentoBusca.trim() === '') setEstabelecimentosFiltrados(estabelecimentos);
            }}
            onBlur={() => {
              setTimeout(() => setEstabelecimentosFiltrados([]), 200);
            }}
            editable={!isViewOnly}
          />
          {estabelecimentosFiltrados.length > 0 && !isViewOnly && (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
              {estabelecimentosFiltrados.map(est => (
                <TouchableOpacity
                  key={est.cpfCnpj}
                  onPress={async () => {
                    setForm(prev => ({ ...prev, estabelecimento: est, funcionario: null as any }));
                    setEstabelecimentoBusca(est.nome);
                    setEstabelecimentosFiltrados([]);
                    setFuncionarioBusca('');
                    setFuncionariosFiltrados([]);
                    await fetchFuncionarios(est.cpfCnpj);
                  }}
                  style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text style={{ color: colors.text }}>{est.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={{ marginBottom: 4, color: colors.text }}>Funcionário</Text>
          <TextInput
            placeholder="Buscar funcionário"
            value={funcionarioBusca || form.funcionario?.nome || ''}
            onChangeText={v => {
              setFuncionarioBusca(v);
              setForm(prev => ({ ...prev, funcionario: null as any }));
            }}
            style={globalStyles.input}
            onFocus={() => {
              if (funcionarioBusca.trim() === '') setFuncionariosFiltrados(funcionarios);
            }}
            onBlur={() => {
              setTimeout(() => setFuncionariosFiltrados([]), 200);
            }}
            editable={!isViewOnly || !!form.estabelecimento}
          />
          {funcionariosFiltrados.length > 0 && !isViewOnly && (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
              {funcionariosFiltrados.map(func => (
                <TouchableOpacity
                  key={func.cpf}
                  onPress={() => {
                    setForm(prev => ({ ...prev, funcionario: func }));
                    setFuncionarioBusca(func.nome);
                    setFuncionariosFiltrados([]);
                  }}
                  style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text style={{ color: colors.text }}>{func.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

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
              setClientesFiltrados([]);
            }}
            editable={!isViewOnly}
          />
          {clientesFiltrados.length > 0 && !isViewOnly && (
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
          <TouchableOpacity onPress={() => !isViewOnly && setShowDatePicker(true)}>
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
          {!isViewOnly && (
            <TextInput
              placeholder="Buscar serviço"
              value={servicoBusca}
              onChangeText={setServicoBusca}
              style={globalStyles.input}
              onFocus={() => {
                if (servicoBusca.trim() === '') setServicosFiltrados(servicos);
              }}
              onBlur={() => {
                setServicosFiltrados([]);
              }}
              editable={!isViewOnly}
            />
          )}
          {servicosFiltrados.length > 0 && !isViewOnly && (
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
                    value={item.valor === 0 ? '' : String(item.valor)}
                    onChangeText={v => {
                      const clean = v.replace(/[^0-9.,]/g, '').replace(',', '.');
                      setServicosSelecionados(prev => {
                        const arr = [...prev];
                        arr[idx].valor = clean === '' ? 0 : parseFloat(clean);
                        return arr;
                      });
                    }}
                    keyboardType="numeric"
                    placeholder="0,00"
                    editable={!isViewOnly}
                  />
                  {!isViewOnly && (
                    <TouchableOpacity onPress={() => handleRemoveServico(idx)} style={{ marginLeft: 8 }}>
                      <MaterialCommunityIcons name="delete-outline" size={22} color="#B3261E" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 8 }}>
            <MaterialCommunityIcons name="cube-outline" size={22} color={colors.primary} /> Produtos
          </Text>
          {!isViewOnly && (
            <TextInput
              placeholder="Buscar produto"
              value={produtoBusca}
              onChangeText={setProdutoBusca}
              style={globalStyles.input}
              onFocus={() => {
                if (produtoBusca.trim() === '') setProdutosFiltrados(produtos);
              }}
              onBlur={() => {
                setProdutosFiltrados([]);
              }}
              editable={!isViewOnly}
            />
          )}
          {produtosFiltrados.length > 0 && !isViewOnly && (
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
                    {!isViewOnly && (
                      <TouchableOpacity
                        onPress={() => handleQuantidadeProdutoChange(idx, String(Math.max(0, item.quantidade - 1)))}
                        style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                      >
                        <MaterialCommunityIcons name="chevron-down" size={22} color={colors.text} />
                      </TouchableOpacity>
                    )}
                    <Text style={{ minWidth: 24, textAlign: 'center', fontSize: 16 }}>{item.quantidade}</Text>
                    {!isViewOnly && (
                      <TouchableOpacity
                        onPress={() => handleQuantidadeProdutoChange(idx, String(item.quantidade + 1))}
                        style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                      >
                        <MaterialCommunityIcons name="chevron-up" size={22} color={colors.text} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={{ flex: 1, color: colors.text, textAlign: 'center' }}>
                    {formatMoney(item.produto.valor)}
                  </Text>
                  <Text style={{ flex: 1, color: colors.text, textAlign: 'center' }}>
                    {formatMoney(item.produto.valor * item.quantidade)}
                  </Text>
                  {!isViewOnly && (
                    <TouchableOpacity onPress={() => handleRemoveProduto(idx)} style={{ marginLeft: 8 }}>
                      <MaterialCommunityIcons name="delete-outline" size={22} color="#B3261E" />
                    </TouchableOpacity>
                  )}
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
            editable={!isViewOnly}
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
        {isViewOnly ? (
          <Button
            mode="contained"
            onPress={() => router.replace('/ordens')}
            style={[globalStyles.primaryButton, { flex: 1 }]}
          >
            Fechar
          </Button>
        ) : (
          <>
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
          </>
        )}
      </View>
    </View>
  );
}