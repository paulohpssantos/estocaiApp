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