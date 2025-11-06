import { Servico } from '../models/servico';
import api from './api';


export async function cadastrarServico(servico: Servico) {
  const response = await api.post('/servico', servico);
  return response.data;
}

export async function listarServicos(): Promise<Servico[]> {
  const response = await api.get(`/servico`);
  return response.data;
}

export async function countServicos(): Promise<number> {
  const response = await api.get(`/servico/count`);
  return response.data;
}