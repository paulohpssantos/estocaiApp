export interface Produto {
  id: number | null;
  nome: string;
  descricao: string;
  valor: number;
  qtdEstoque: number;
  estoqueMinimo: number;
  dataFabricacao: string;
  dataValidade: string;
  
}