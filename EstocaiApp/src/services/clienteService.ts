import { Cliente } from '../models/cliente';
import api from './api';


export async function cadastrarCliente(cliente: Cliente) {
  const response = await api.post('/cliente', cliente);
  return response.data;
}

export async function listarClientes(usuarioCpf: string): Promise<Cliente[]> {
  const response = await api.get(`/cliente/listar/${usuarioCpf}`);
  return response.data;
}

export async function countClientes(usuarioCpf: string): Promise<number> {
  const response = await api.get(`/cliente/count/${usuarioCpf}`);
  return response.data;
}


