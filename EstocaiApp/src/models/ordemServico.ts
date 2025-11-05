import { Cliente } from './cliente';
import { Estabelecimento } from './estabelecimento';
import { Funcionario } from './funcionario';


export interface OrdemServico {
  id: number | null;
  numeroOS: string;
  estabelecimento: Estabelecimento;
  funcionario: Funcionario;
  cliente: Cliente;
  dataAbertura: string; 
  observacoes?: string | null;
  status: string;
  valorTotal: number; 
}