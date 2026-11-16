import AsyncStorage from "@react-native-async-storage/async-storage";
import { Usuario } from "../models/usuario";
import { parseDateString } from "./formatters";

const NOMES_PLANO: Record<string, string> = {
    GRATUITO: "Teste grátis",
    MENSAL: "Mensal",
    SEMESTRAL: "Semestral",
    ANUAL: "Anual",
};

export interface PlanoStatus {
    /** Código do plano em maiúsculas: GRATUITO, MENSAL, SEMESTRAL, ANUAL */
    codigo: string;
    /** Nome amigável para exibir na tela */
    nome: string;
    isPago: boolean;
    isExpirado: boolean;
    /** Dias até a expiração (0 = expira hoje; negativo = já expirou) */
    diasRestantes: number | null;
    /** Data de expiração no formato yyyy-MM-dd */
    dataExpiracao: string | null;
}

export function getPlanoStatus(usuario?: Partial<Usuario> | null): PlanoStatus | null {
    if (!usuario) return null;
    const codigo = (usuario.plano ?? "GRATUITO").toUpperCase();
    const isPago = codigo !== "GRATUITO" && codigo in NOMES_PLANO;

    let diasRestantes: number | null = null;
    const exp = parseDateString(usuario.dataExpiracao);
    if (exp) {
        const hoje = new Date();
        const hojeMid = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
        const expMid = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate()).getTime();
        diasRestantes = Math.round((expMid - hojeMid) / 86_400_000);
    }

    return {
        codigo,
        nome: NOMES_PLANO[codigo] ?? codigo,
        isPago,
        isExpirado: diasRestantes != null && diasRestantes < 0,
        diasRestantes,
        dataExpiracao: usuario.dataExpiracao ?? null,
    };
}

export async function getUsuarioSalvo(): Promise<Usuario | null> {
    try {
        const s = await AsyncStorage.getItem("usuario");
        return s ? (JSON.parse(s) as Usuario) : null;
    } catch {
        return null;
    }
}

/** Mescla o usuário devolvido pelo backend (ex.: após atualizar o plano) no usuário salvo localmente. */
export async function salvarUsuarioAtualizado(atualizado: Partial<Usuario> | null | undefined): Promise<Usuario | null> {
    if (!atualizado) return getUsuarioSalvo();
    const atual = await getUsuarioSalvo();
    const merged = { ...(atual ?? {}), ...atualizado } as Usuario;
    await AsyncStorage.setItem("usuario", JSON.stringify(merged));
    return merged;
}

export function textoDiasRestantes(dias: number | null): string {
    if (dias == null) return "";
    if (dias < 0) return "expirado";
    if (dias === 0) return "expira hoje";
    if (dias === 1) return "falta 1 dia";
    return `faltam ${dias} dias`;
}
