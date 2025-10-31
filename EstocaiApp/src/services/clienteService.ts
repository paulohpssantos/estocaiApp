import { Cliente } from '../models/cliente';
import api from './api';


export async function cadastrarCliente(cliente: Cliente) {
  const response = await api.post('/cliente', cliente);
  return response.data;
}

export async function listarClientes(): Promise<Cliente[]> {
  const response = await api.get(`/cliente`);
  return response.data;
}