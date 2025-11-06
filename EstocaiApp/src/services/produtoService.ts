import { Produto } from '../models/produto';
import api from './api';


export async function cadastrarProduto(produto: Produto) {
  const response = await api.post('/produto', produto);
  return response.data;
}

export async function listarProdutos(): Promise<Produto[]> {
  const response = await api.get(`/produto`);
  return response.data;
}

export async function countProdutos(): Promise<number> {
  const response = await api.get(`/produto/count`);
  return response.data;
}
