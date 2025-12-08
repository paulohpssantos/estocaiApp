export function formatCpfCnpj(value: string) {
  if (!value) return '';
  if (value.length === 14) {
    // CNPJ
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  } else if (value.length === 11) {
    // CPF
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return value;
}

export function formatCelular(value: string) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1)$2-$3');
}

export function formatDateBR(date: string) {
  if (!date) return '';
  const [ano, mes, dia] = date.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function parseDateBRtoDate(dateBR: string): Date {
  if (!dateBR || dateBR.length !== 10) return new Date();
  const [day, month, year] = dateBR.split('/');
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function parseDateString(dateStr?: string): Date | null {
  if (!dateStr) return null;
  // dd/mm/yyyy
  if (dateStr.includes('/')) {
    const [dia, mes, ano] = dateStr.split('/');
    if (ano && mes && dia) return new Date(Number(ano), Number(mes) - 1, Number(dia));
    return null;
  }
  // yyyy-mm-dd or dd-mm-yyyy
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // yyyy-mm-dd
      if (parts[0].length === 4) {
        const [ano, mes, dia] = parts;
        return new Date(Number(ano), Number(mes) - 1, Number(dia));
      }
      // dd-mm-yyyy
      const [dia, mes, ano] = parts;
      return new Date(Number(ano), Number(mes) - 1, Number(dia));
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}


export function formatISODate(dateStr: string) {
  if (!dateStr) return '';
  const [dia, mes, ano] = dateStr.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

export function formatMoney(value: number | string) {
  const number = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(number)) return '';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatMoneyNoSymbol(value: number | string) {
  const number = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(number)) return '';
  return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDurationHM(hm: string) {
  if (!hm) return '';
  const [h, m] = hm.split(':');
  const hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);
  let result = '';
  if (hours) result += `${hours}h`;
  if (minutes) result += (hours ? ' ' : '') + `${minutes}min`;
  return result || '0min';
}

