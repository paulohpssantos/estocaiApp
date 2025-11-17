import { Estabelecimento } from './estabelecimento';
import { Usuario } from './usuario';

export interface Funcionario {
  cpf: string;
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
  ativo: boolean;
  estabelecimento: Estabelecimento;
  usuario: Usuario;
}