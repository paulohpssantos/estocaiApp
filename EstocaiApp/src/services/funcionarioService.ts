import { Funcionario } from '../models/funcionario';
import api from './api';


export async function cadastrarFuncionario(funcionario: Funcionario) {
  const response = await api.post('/funcionario', funcionario);
  return response.data;
}

export async function listarFuncionarios(): Promise<Funcionario[]> {
  const response = await api.get(`/funcionario`);
  return response.data;
}

export async function listarFuncionariosPorEstabelecimento(estabelecimentoCpfCnpj: string): Promise<Funcionario[]> {
  const response = await api.get(`/funcionario/${estabelecimentoCpfCnpj}`);
  return response.data;
}