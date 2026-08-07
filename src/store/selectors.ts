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
import { monthsBetween, addMonths } from '../utils/dates';
import { installmentAmount } from '../utils/money';

/** O item está ativo neste mês? */
export function isItemActiveInMonth(item: RecurringItem, month: MonthKey): boolean {
  const startDiff = monthsBetween(item.startMonth, month); // >=0 se month >= start
  if (startDiff < 0) return false;
  if (item.fixed) {
    if (item.endMonth && monthsBetween(item.endMonth, month) > 0) return false;
    return true;
  }
  // avulso: só no mês de início
  return startDiff === 0;
}

export function itemsForMonth(state: AppState, kind: ItemKind, month: MonthKey): RecurringItem[] {
  return state.items
    .filter((i) => i.kind === kind && isItemActiveInMonth(i, month))
    .sort((a, b) => {
      // fixos primeiro, depois por nome
      if (a.fixed !== b.fixed) return a.fixed ? -1 : 1;
      return a.name.localeCompare(b.name, 'pt-BR');
    });
}

export function getActual(state: AppState, itemId: string, month: MonthKey): Actual | undefined {
  return state.actuals[itemId]?.[month];
}

/** A compra incide neste mês? (recorrente: todo mês a partir do início; parcelada: dentro das parcelas) */
export function cardActiveInMonth(card: CardPurchase, month: MonthKey): boolean {
  const idx = monthsBetween(card.firstMonth, month);
  if (card.recurring) return idx >= 0;
  return idx >= 0 && idx < card.installments;
}

/**
 * Valor desta cobrança que cai no mês (0 se não incidir).
 * - Recorrente: valor LANÇADO daquele mês (se houver), senão o previsto (mensal).
 * - Parcelada: valor da parcela (fixo).
 */
export function cardMonthAmount(state: AppState, card: CardPurchase, month: MonthKey): number {
  if (!cardActiveInMonth(card, month)) return 0;
  if (card.recurring) {
    return state.cardActuals[card.id]?.[month]?.amount ?? card.total;
  }
  const idx = monthsBetween(card.firstMonth, month);
  return installmentAmount(card.total, card.installments, idx);
}

/** A cobrança está confirmada (lançada) neste mês? */
export function cardMonthConfirmed(state: AppState, card: CardPurchase, month: MonthKey): boolean {
  if (!cardActiveInMonth(card, month)) return false;
  if (card.recurring) return !!state.cardActuals[card.id]?.[month];
  return !card.planned;
}

/** Índice (1-based) da parcela deste mês, ou null (recorrentes não têm parcela). */
export function cardInstallmentIndex(card: CardPurchase, month: MonthKey): number | null {
  if (card.recurring) return null;
  const idx = monthsBetween(card.firstMonth, month);
  if (idx < 0 || idx >= card.installments) return null;
  return idx + 1;
}

export function cardsForMonth(state: AppState, month: MonthKey): CardPurchase[] {
  return state.cards
    .filter((c) => cardActiveInMonth(c, month))
    .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'));
}

/** Fatura PREVISTA do mês: valor esperado de todas as cobranças (confirmadas usam o lançado). */
export function cardPlannedForMonth(state: AppState, month: MonthKey): number {
  return state.cards.reduce((sum, c) => sum + cardMonthAmount(state, c, month), 0);
}

/** Fatura REALIZADA do mês: só as cobranças confirmadas naquele mês. */
export function cardRealizedForMonth(state: AppState, month: MonthKey): number {
  return state.cards.reduce(
    (sum, c) => sum + (cardMonthConfirmed(state, c, month) ? cardMonthAmount(state, c, month) : 0),
    0,
  );
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
    if (monthsBetween(item.startMonth, month) < 0) continue;
    if (item.fixed) {
      const last = item.endMonth && monthsBetween(item.endMonth, month) < 0 ? item.endMonth : month;
      const count = monthsBetween(item.startMonth, last);
      for (let k = 0; k <= count; k++) {
        const m = addMonths(item.startMonth, k);
        aportado += getActual(state, item.id, m)?.amount ?? 0;
      }
    } else {
      aportado += getActual(state, item.id, item.startMonth)?.amount ?? 0;
    }
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
