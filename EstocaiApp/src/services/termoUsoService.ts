import api from './api';


export async function mostrarTermos(cpf: string): Promise<string> {
  const response = await api.get(`/termos-uso?cpf=${encodeURIComponent(cpf)}`, {
    responseType: 'text' as const,
  });
  // response.data será a string HTML renderizada
  return response.data as string;
}