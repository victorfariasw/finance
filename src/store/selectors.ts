// Seletores puros: recebem o estado + mês e derivam o que as telas mostram.
import { AppState, Actual, CardPurchase, ItemKind, MonthKey, RecurringItem, YieldEntry } from '../types';
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
    .filter((c) => cardInstallmentIndex(c, month) !== null)
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
  saldoPrevisto: number;    // já descontando o aporte
  saldoRealizado: number;   // já descontando o aporte
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

  return {
    plannedIncome,
    realizedIncome,
    plannedExpense,
    realizedExpense,
    cardPlanned,
    cardRealized,
    plannedAporte,
    realizedAporte,
    // Aporte também sai do caixa do mês, então reduz o saldo disponível.
    saldoPrevisto: plannedIncome - plannedExpense - plannedAporte,
    saldoRealizado: realizedIncome - realizedExpense - realizedAporte,
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

export interface Montante {
  aportado: number;    // soma dos aportes acumulados até o mês
  rendimentos: number; // soma dos rendimentos acumulados até o mês
  total: number;       // patrimônio investido
}

/**
 * Patrimônio investido acumulado até (e incluindo) `month`.
 * Para cada aporte, usa o valor realizado quando lançado, senão o previsto —
 * assim projeta o montante mesmo em meses futuros.
 */
export function montanteUpTo(state: AppState, month: MonthKey): Montante {
  let aportado = 0;
  for (const item of state.items) {
    if (item.kind !== 'investment') continue;
    // meses ativos do item dentro de [startMonth, month]
    if (monthsBetween(item.startMonth, month) < 0) continue;
    if (item.fixed) {
      const last = item.endMonth && monthsBetween(item.endMonth, month) < 0 ? item.endMonth : month;
      const count = monthsBetween(item.startMonth, last);
      for (let k = 0; k <= count; k++) {
        const m = addMonths(item.startMonth, k);
        aportado += getActual(state, item.id, m)?.amount ?? item.planned;
      }
    } else if (monthsBetween(item.startMonth, month) >= 0) {
      aportado += getActual(state, item.id, item.startMonth)?.amount ?? item.planned;
    }
  }

  let rendimentos = 0;
  for (const y of state.yields) {
    if (monthsBetween(y.month, month) >= 0) rendimentos += y.amount;
  }

  return { aportado, rendimentos, total: aportado + rendimentos };
}
