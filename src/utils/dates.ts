import { MonthKey } from '../types';

const MONTHS_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export function toMonthKey(year: number, month1to12: number): MonthKey {
  return `${year}-${String(month1to12).padStart(2, '0')}`;
}

export function parseMonthKey(key: MonthKey): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m };
}

export function currentMonthKey(): MonthKey {
  const now = new Date();
  return toMonthKey(now.getFullYear(), now.getMonth() + 1);
}

export function addMonths(key: MonthKey, n: number): MonthKey {
  const { year, month } = parseMonthKey(key);
  const zeroBased = (year * 12 + (month - 1)) + n;
  const y = Math.floor(zeroBased / 12);
  const m = (zeroBased % 12) + 1;
  return toMonthKey(y, m);
}

/** Quantidade de meses de `a` até `b` (b - a). Pode ser negativo. */
export function monthsBetween(a: MonthKey, b: MonthKey): number {
  const pa = parseMonthKey(a);
  const pb = parseMonthKey(b);
  return (pb.year * 12 + (pb.month - 1)) - (pa.year * 12 + (pa.month - 1));
}

export function compareMonth(a: MonthKey, b: MonthKey): number {
  return monthsBetween(b, a); // >0 se a>b
}

/** "2026-08" -> "Agosto de 2026" */
export function labelLong(key: MonthKey): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTHS_LONG[month - 1]} de ${year}`;
}

/** "2026-08" -> "Ago 2026" */
export function labelMedium(key: MonthKey): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTHS_SHORT[month - 1]} ${year}`;
}

/** "2026-08" -> "Ago/26" */
export function labelShort(key: MonthKey): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTHS_SHORT[month - 1]}/${String(year).slice(-2)}`;
}

export function monthShortName(key: MonthKey): string {
  const { month } = parseMonthKey(key);
  return MONTHS_SHORT[month - 1];
}

export function isCurrentOrFuture(key: MonthKey): boolean {
  return monthsBetween(currentMonthKey(), key) >= 0;
}
