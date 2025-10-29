import { Usuario } from './usuario';

export interface Estabelecimento {
  cpfCnpj: string;
  nome: string;
  logradouro: string;
  cep: string;
  uf: string;
  municipio: string;
  telefone: string;
  email: string;
  usuario: Usuario;
  ativo: boolean;
}