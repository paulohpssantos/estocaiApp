import { Servico } from '../models/servico';
import api from './api';


export async function cadastrarServico(servico: Servico) {
  const response = await api.post('/servico', servico);
  return response.data;
}

export async function listarServicos(cpf: string): Promise<Servico[]> {
  const response = await api.get(`/servico?cpf=${encodeURIComponent(cpf)}`);
  return response.data;
}

export async function countServicos(cpf: string): Promise<number> {
  const response = await api.get(`/servico/count/${encodeURIComponent(cpf)}`);
  return response.data;
}
