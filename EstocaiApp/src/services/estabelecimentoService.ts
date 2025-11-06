import { Estabelecimento } from '../models/estabelecimento';
import api from './api';


export async function cadastrarEstabelecimento(estabelecimento: Estabelecimento) {
  const response = await api.post('/estabelecimento', estabelecimento);
  return response.data;
}

export async function listarEstabelecimentosPorCpf(cpf: string): Promise<Estabelecimento[]> {
  const response = await api.get(`/estabelecimento?cpf=${encodeURIComponent(cpf)}`);
  return response.data;
}

export async function countEstabelecimentos(cpf: string): Promise<number> {
  const response = await api.get(`/estabelecimento/count/${encodeURIComponent(cpf)}`);
  return response.data;
}