import { OrdemServico } from '../models/ordemServico';
import { ProdutoOrdemServico } from '../models/produtoOrdemServico';
import { ServicoOrdemServico } from '../models/servicoOrdemServico';
import api from './api';


export async function cadastrarOrdemServico(ordemServico: OrdemServico) {
  const response = await api.post('/ordem-servico', ordemServico);
  return response.data;
}

export async function cadastrarProdutosOrdemServico(produtoOrdemServico: ProdutoOrdemServico) {
  const response = await api.post('/produto-ordem-servico', produtoOrdemServico);
  return response.data;
}

export async function cadastrarServicoOrdemServico(servicoOrdemServico: ServicoOrdemServico) {
  const response = await api.post('/servico-ordem-servico', servicoOrdemServico);
  return response.data;
}

export async function listarOrdensServico(cpf: string): Promise<OrdemServico[]> {
  const response = await api.get(`/ordem-servico?cpf=${encodeURIComponent(cpf)}`);
  return response.data;
}

export async function listarProdutosOrdemServico(idOrdemServico: number): Promise<ProdutoOrdemServico[]> {
  const response = await api.get(`/produto-ordem-servico?idOrdemServico=${idOrdemServico}`);
  return response.data;
}

export async function listarServicosOrdemServico(idOrdemServico: number): Promise<ServicoOrdemServico[]> {
  const response = await api.get(`/servico-ordem-servico?idOrdemServico=${idOrdemServico}`);
  return response.data;
}

export async function deletarProdutosOrdemServicoPorOrdem(ordemId: number) {
  const response = await api.delete(`/produto-ordem-servico/por-ordem/${ordemId}`);
  return response.data;
}


export async function deletarServicosOrdemServicoPorOrdem(ordemId: number) {
  const response = await api.delete(`/servico-ordem-servico/por-ordem/${ordemId}`);
  return response.data;
}

export async function deletarOrdemServico(ordemId: number) {
  const response = await api.delete(`/ordem-servico/${ordemId}`);
  return response.data;
}

export async function countOrdensServico(cpf: string): Promise<number> {
  const response = await api.get(`/ordem-servico/count/${encodeURIComponent(cpf)}`);
  return response.data;
}


