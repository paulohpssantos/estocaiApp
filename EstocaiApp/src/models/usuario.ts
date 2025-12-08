export interface Usuario {
    cpf: string;
    nome: string;
    celular: string;
    senha: string;
    email: string;
    dataExpiracao: string;
    dataCadastro: string;
    dataInicioPlano: string;
    ultimoAcesso: string;
    plano: string;
    leuContrato: boolean;
}

export interface UpdatePlanoRequest {
    cpf: string;
    plano: string;
}