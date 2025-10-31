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

