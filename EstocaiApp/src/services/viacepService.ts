import axios from 'axios';

export async function getEndereco(cep: string): Promise<any> {
  const response = await axios.get(`https://viacep.com.br/ws/${cep}/json`);
  return response.data;
}