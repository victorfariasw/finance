// Seletores puros: recebem o estado + mês e derivam o que as telas mostram.
import {
  AppState,
  Actual,
  CardPurchase,
  ItemKind,
  MonthKey,
  RecurringItem,
  YieldEntry,
  WithdrawalEntry,
} from '../types';
import { monthsBetween } from '../utils/dates';
import { installmentAmount } from '../utils/money';

export function itemsForMonth(state: AppState, kind: ItemKind, month: MonthKey): RecurringItem[] {
  return state.items
    .filter((i) => i.kind === kind && i.month === month)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function getActual(state: AppState, itemId: string, month: MonthKey): Actual | undefined {
  return state.actuals[itemId]?.[month];
}

/** A parcela desta compra incide neste mês? */
export function cardActiveInMonth(card: CardPurchase, month: MonthKey): boolean {
  const idx = monthsBetween(card.firstMonth, month);
  return idx >= 0 && idx < card.installments;
}

/** Valor da parcela desta compra que cai no mês (0 se não cair). */
export function cardInstallmentForMonth(card: CardPurchase, month: MonthKey): number {
  const idx = monthsBetween(card.firstMonth, month);
  if (idx < 0 || idx >= card.installments) return 0;
  return installmentAmount(card.total, card.installments, idx);
}

/** Índice (1-based) da parcela deste mês, ou null. */
export function cardInstallmentIndex(card: CardPurchase, month: MonthKey): number | null {
  const idx = monthsBetween(card.firstMonth, month);
  if (idx < 0 || idx >= card.installments) return null;
  return idx + 1;
}

export function cardsForMonth(state: AppState, month: MonthKey): CardPurchase[] {
  return state.cards
    .filter((c) => cardActiveInMonth(c, month))
    .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'));
}

/** Fatura PREVISTA do mês: parcelas de todas as compras (previstas + confirmadas). */
export function cardPlannedForMonth(state: AppState, month: MonthKey): number {
  return state.cards.reduce((sum, c) => sum + cardInstallmentForMonth(c, month), 0);
}

/** Fatura REALIZADA do mês: parcelas apenas das compras confirmadas. */
export function cardRealizedForMonth(state: AppState, month: MonthKey): number {
  return state.cards.reduce((sum, c) => sum + (c.planned ? 0 : cardInstallmentForMonth(c, month)), 0);
}

export interface MonthSummary {
  plannedIncome: number;
  realizedIncome: number;
  plannedExpense: number;   // saídas comuns + cartão
  realizedExpense: number;  // saídas comuns realizadas + cartão
  cardPlanned: number;      // fatura prevista (todas as compras)
  cardRealized: number;     // fatura realizada (só confirmadas)
  plannedAporte: number;    // investimento previsto no mês
  realizedAporte: number;   // investimento realizado no mês
  withdrawal: number;       // retirada de investimento no mês (entra como saldo)
  saldoPrevisto: number;    // já descontando o aporte e somando a retirada
  saldoRealizado: number;   // já descontando o aporte e somando a retirada
}

export function monthSummary(state: AppState, month: MonthKey): MonthSummary {
  const incomes = itemsForMonth(state, 'income', month);
  const expenses = itemsForMonth(state, 'expense', month);
  const aportes = itemsForMonth(state, 'investment', month);
  const cardPlanned = cardPlannedForMonth(state, month);
  const cardRealized = cardRealizedForMonth(state, month);

  let plannedIncome = 0;
  let realizedIncome = 0;
  for (const i of incomes) {
    plannedIncome += i.planned;
    realizedIncome += getActual(state, i.id, month)?.amount ?? 0;
  }

  let plannedExpenseItems = 0;
  let realizedExpenseItems = 0;
  for (const e of expenses) {
    plannedExpenseItems += e.planned;
    realizedExpenseItems += getActual(state, e.id, month)?.amount ?? 0;
  }

  let plannedAporte = 0;
  let realizedAporte = 0;
  for (const a of aportes) {
    plannedAporte += a.planned;
    realizedAporte += getActual(state, a.id, month)?.amount ?? 0;
  }

  const plannedExpense = plannedExpenseItems + cardPlanned;
  const realizedExpense = realizedExpenseItems + cardRealized;

  // Retirada de investimento volta para o caixa do mês (entra como saldo).
  const withdrawal = monthWithdrawalTotal(state, month);

  return {
    plannedIncome,
    realizedIncome,
    plannedExpense,
    realizedExpense,
    cardPlanned,
    cardRealized,
    plannedAporte,
    realizedAporte,
    withdrawal,
    // Aporte sai do caixa (reduz); retirada de investimento entra (soma).
    saldoPrevisto: plannedIncome - plannedExpense - plannedAporte + withdrawal,
    saldoRealizado: realizedIncome - realizedExpense - realizedAporte + withdrawal,
  };
}

// ---------------------------------------------------------------------------
// Investimentos
// ---------------------------------------------------------------------------

export function yieldsForMonth(state: AppState, month: MonthKey): YieldEntry[] {
  return state.yields
    .filter((y) => y.month === month)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function monthYieldTotal(state: AppState, month: MonthKey): number {
  return yieldsForMonth(state, month).reduce((sum, y) => sum + y.amount, 0);
}

export function withdrawalsForMonth(state: AppState, month: MonthKey): WithdrawalEntry[] {
  return state.withdrawals
    .filter((w) => w.month === month)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function monthWithdrawalTotal(state: AppState, month: MonthKey): number {
  return withdrawalsForMonth(state, month).reduce((sum, w) => sum + w.amount, 0);
}

export interface Montante {
  aportado: number;    // soma dos aportes REALIZADOS acumulados até o mês
  rendimentos: number; // soma dos rendimentos acumulados até o mês
  retiradas: number;   // soma das retiradas acumuladas até o mês
  total: number;       // patrimônio investido = aportado + rendimentos - retiradas
}

/**
 * Patrimônio investido acumulado até (e incluindo) `month`.
 * Conta apenas o que foi REALMENTE investido (aporte realizado) — o aporte
 * previsto não entra no total. Rendimentos somam; retiradas subtraem.
 */
export function montanteUpTo(state: AppState, month: MonthKey): Montante {
  let aportado = 0;
  for (const item of state.items) {
    if (item.kind !== 'investment') continue;
    if (monthsBetween(item.month, month) < 0) continue; // só aportes de meses <= selecionado
    aportado += getActual(state, item.id, item.month)?.amount ?? 0;
  }

  let rendimentos = 0;
  for (const y of state.yields) {
    if (monthsBetween(y.month, month) >= 0) rendimentos += y.amount;
  }

  let retiradas = 0;
  for (const w of state.withdrawals) {
    if (monthsBetween(w.month, month) >= 0) retiradas += w.amount;
  }

  return { aportado, rendimentos, retiradas, total: aportado + rendimentos - retiradas };
}
