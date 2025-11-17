import { Produto } from '../models/produto';
import api from './api';


export async function cadastrarProduto(produto: Produto) {
  const response = await api.post('/produto', produto);
  return response.data;
}

export async function listarProdutos(cpf: string): Promise<Produto[]> {
  const response = await api.get(`/produto?cpf=${encodeURIComponent(cpf)}`);
  return response.data;
}

export async function countProdutos(cpf: string): Promise<number> {
  const response = await api.get(`/produto/count/${encodeURIComponent(cpf)}`);
  return response.data;
}

