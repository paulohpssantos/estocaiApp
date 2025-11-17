import { Cliente } from '../models/cliente';
import api from './api';


export async function cadastrarCliente(cliente: Cliente) {
  const response = await api.post('/cliente', cliente);
  return response.data;
}

export async function listarClientes(cpf: string): Promise<Cliente[]> {
  const response = await api.get(`/cliente?cpf=${encodeURIComponent(cpf)}`);
  return response.data;
}

export async function countClientes(cpf: string): Promise<number> {
  const response = await api.get(`/cliente/count/${encodeURIComponent(cpf)}`);
  return response.data;
}


