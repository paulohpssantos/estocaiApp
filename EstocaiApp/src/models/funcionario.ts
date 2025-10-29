import { Estabelecimento } from './estabelecimento';

export interface Funcionario {
  cpf: string;
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
  ativo: boolean;
  estabelecimento: Estabelecimento;
}