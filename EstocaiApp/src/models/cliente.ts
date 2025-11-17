import { Estabelecimento } from './estabelecimento';
import { Usuario } from './usuario';

export interface Cliente {
  cpf: string;
  nome: string;
  telefone: string;
  email: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  uf: string;
  municipio: string;
  dataNascimento: string;
  ativo: boolean;
  estabelecimento: Estabelecimento;
  usuario: Usuario;
}