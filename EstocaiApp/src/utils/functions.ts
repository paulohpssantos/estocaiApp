import colors from "../../constants/colors";
import { Usuario } from "../models/usuario";
import { parseDateString } from "./formatters";

const statusBackgroundColors = {
    'Aberta': colors.backgroundYellow,
    'Em Andamento': colors.backgroundBlue,
    'Finalizada': colors.backgroundGreen,
    'Cancelada': colors.accent,
};
const statusBorderColors = {
    'Aberta': colors.yellowBorder,
    'Em Andamento': colors.blueBorder,
    'Finalizada': colors.greenBorder,
    'Cancelada': colors.border,
};
const statusFontColors = {
    'Aberta': colors.darkYellow,
    'Em Andamento': colors.darkBlue,
    'Finalizada': colors.darkGreen,
    'Cancelada': colors.secondary,
};

export function setStatusBackgroundColor(status: string) {
    return statusBackgroundColors[status as keyof typeof statusBackgroundColors] || '#EEE';

}

export function setStatusBorderColor(status: string) {
    return statusBorderColors[status as keyof typeof statusBorderColors] || '#EEE';
}

export function setStatusFontColor(status: string) {
    return statusFontColors[status as keyof typeof statusFontColors] || '#EEE';
}

//Verifica estoque mínimo
export function verifyIsLowStock(qtdEstoque: number, estoqueMinimo: number): boolean {
    return qtdEstoque >= estoqueMinimo ? false : true;

}

//Validar datas de Vencimento
const parseDate = (str: string) => {
    if (!str) return null;
    // Aceita tanto aaaa-mm-dd quanto aaaa/mm/dd
    const clean = str.replace(/\//g, '-');
    const [ano, mes, dia] = clean.split('-');
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
};


const hoje = new Date();
let isVencido = false;
let isPertoVencimento = false;

//valida se a data de validade está vencida
export function isExpired(dateStr: string): boolean {
    const validade = parseDate(dateStr);
    const hoje = new Date();
    let isVencido = false;

    if (validade) {
        const validadeCopy = new Date(validade.getTime());
        const hojeCopy = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        validadeCopy.setHours(0, 0, 0, 0);

        isVencido = validadeCopy < hojeCopy;
    }
    return isVencido;
}


//valida se a data de validade está perto do vencimento (30 dias)
export function isNearExpiration(dateStr: string): boolean {
    const validade = parseDate(dateStr);
    const hoje = new Date();
    let isPertoVencimento = false;

    if (validade) {
        const validadeCopy = new Date(validade.getTime());
        const hojeCopy = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        validadeCopy.setHours(0, 0, 0, 0);


        const diff = validadeCopy.getTime() - hojeCopy.getTime();
        isPertoVencimento = !isVencido && diff <= 30 * 24 * 60 * 60 * 1000 && diff >= 0;
    }
    return isPertoVencimento;

}

/**
 * Retorna a data resultante de adicionar `days` dias à data atual.
 * - days: número inteiro (positivo para futuro, negativo para passado, 0 para hoje)
 * - Retorna string no formato 'yyyy-mm-dd'
 * - Lança erro se `days` não for inteiro
 */
export function daysFromNow(days: number): string {
    if (!Number.isInteger(days)) {
        throw new Error('daysFromNow: o parâmetro "days" deve ser um número inteiro.');
    }

    const today = new Date();
    // normaliza para meia-noite local
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    base.setDate(base.getDate() + days);

    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const d = String(base.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

/**
 * Retorna a data resultante de adicionar `months` meses à data atual.
 * - months: número inteiro (positivo para futuro, negativo para passado, 0 para o mês atual)
 * - Ajusta para o último dia do mês quando o dia original não existir no mês destino
 *   Ex.: 31 Jan + 1 mês -> 28/29 Fev (dependendo de ano bissexto)
 * - Retorna string no formato 'yyyy-mm-dd'
 * - Lança erro se `months` não for inteiro
 */
export function addMonthsFromNow(months: number): string {
    if (!Number.isInteger(months)) {
        throw new Error('addMonthsFromNow: o parâmetro "months" deve ser um número inteiro.');
    }

    const today = new Date();
    // normaliza para meia-noite local
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // cálculo do ano/mês alvo usando aritmética de meses (permite months negativo)
    const targetMonthIndex = base.getMonth() + months; // 0-based month index with overflow
    const targetYear = base.getFullYear() + Math.floor(targetMonthIndex / 12);
    // Ajuste do mês quando targetMonthIndex for negativo
    let targetMonth = targetMonthIndex % 12;
    if (targetMonth < 0) targetMonth += 12;

    // último dia do mês destino
    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    // dia alvo = mínimo entre dia atual e último dia do mês destino
    const targetDay = Math.min(base.getDate(), lastDayOfTargetMonth);

    const targetDate = new Date(targetYear, targetMonth, targetDay);

    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

/**
 * Retorna a data resultante de adicionar `years` anos à data atual.
 * - years: número inteiro (positivo para futuro, negativo para passado, 0 para o ano atual)
 * - Ajusta quando o dia não existe no mês destino (ex.: 29/02 num ano não bissexto -> 28/02)
 * - Retorna string no formato 'yyyy-mm-dd'
 * - Lança erro se `years` não for inteiro
 */
export function addYearsFromNow(years: number): string {
    if (!Number.isInteger(years)) {
        throw new Error('addYearsFromNow: o parâmetro "years" deve ser um número inteiro.');
    }

    const today = new Date();
    // normaliza para meia-noite local
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const targetYear = base.getFullYear() + years;
    const targetMonth = base.getMonth(); // 0-based
    // último dia do mês destino (considera fevereiro com 28/29)
    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    // se o dia atual não existir no mês destino, usa o último dia do mês
    const targetDay = Math.min(base.getDate(), lastDayOfTargetMonth);

    const targetDate = new Date(targetYear, targetMonth, targetDay);

    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

export function validaUsuarioExpirado(usuarioString: string): boolean {

    const usuario = JSON.parse(usuarioString) as Usuario;
    
    let referenceDate: Date = new Date();
    if (usuario?.ultimoAcesso) {
        const parsed = parseDateString(usuario.ultimoAcesso);
        if (parsed) {
            referenceDate = parsed;
        }else {
            const alt = new Date(usuario.ultimoAcesso);
            if (!isNaN(alt.getTime())) referenceDate = alt;
        }        
    }    

    // normaliza hoje meia-noite
    const hojeMid = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

    const expDate = parseDateString(usuario?.dataExpiracao);
    if (expDate) {
        const expMid = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
        // se a data atual for maior que a dataExpiracao -> abrir planos (conforme solicitado)
        if (hojeMid.getTime() > expMid.getTime()) {
            return true;
        }
    }
    return false;
}
