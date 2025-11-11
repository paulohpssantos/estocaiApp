import colors from "../../constants/colors";

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
    const estoqueRatio = estoqueMinimo > 0 ? qtdEstoque / estoqueMinimo : 1;
    return estoqueRatio <= 0.2;
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
      validadeCopy.setHours(0,0,0,0);

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
        validadeCopy.setHours(0,0,0,0);

      
        const diff = validadeCopy.getTime() - hojeCopy.getTime();
        isPertoVencimento = !isVencido && diff <= 30 * 24 * 60 * 60 * 1000 && diff >= 0;
    }  
    return isPertoVencimento;

}
    