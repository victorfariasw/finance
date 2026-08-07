// Dinheiro sempre em CENTAVOS (inteiro). Formatação e parsing manuais (pt-BR)
// para não depender de Intl no dispositivo.

function groupThousands(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 123456 (centavos) -> "R$ 1.234,56" */
export function formatBRL(cents: number, withSymbol = true): string {
  const neg = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const reais = Math.floor(abs / 100);
  const cent = String(abs % 100).padStart(2, '0');
  const body = `${groupThousands(String(reais))},${cent}`;
  return `${neg ? '-' : ''}${withSymbol ? 'R$ ' : ''}${body}`;
}

/** Versão curta para eixos/gráficos: 123456 -> "R$ 1,2 mil" */
export function formatBRLShort(cents: number): string {
  const abs = Math.abs(cents);
  const reais = abs / 100;
  const sign = cents < 0 ? '-' : '';
  if (reais >= 1000) {
    const mil = reais / 1000;
    const s = mil >= 10 ? String(Math.round(mil)) : mil.toFixed(1).replace('.', ',');
    return `${sign}R$ ${s} mil`;
  }
  return `${sign}R$ ${Math.round(reais)}`;
}

/**
 * Estilo "caixa eletrônico": a string de dígitos representa os centavos.
 * "500000" -> 500000 centavos (R$ 5.000,00)
 */
export function digitsToCents(digits: string): number {
  const clean = digits.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export function centsToDigits(cents: number): string {
  return String(Math.abs(Math.round(cents)));
}

/**
 * Valor da parcela `index` (0-based) de uma compra parcelada.
 * O resto (centavos) é distribuído nas primeiras parcelas para fechar o total.
 */
export function installmentAmount(total: number, installments: number, index: number): number {
  if (installments <= 0) return 0;
  const base = Math.floor(total / installments);
  const rem = total - base * installments;
  return base + (index < rem ? 1 : 0);
}
