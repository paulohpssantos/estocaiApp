import { OrdemServico } from './ordemServico';
import { Produto } from './produto';


export interface ProdutoOrdemServico {
  id: number | null; 
  ordemServico: OrdemServico; 
  produto: Produto; 
  quantidade: number;
  valorTotal: number; 
}