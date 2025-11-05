import { OrdemServico } from './ordemServico';
import { Servico } from './servico';


export interface ServicoOrdemServico {
  id: number | null; 
  ordemServico: OrdemServico; 
  servico: Servico; 
  valorTotal: number; 
}