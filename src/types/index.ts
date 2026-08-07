// Modelos de dados. Todos os valores monetários são armazenados em CENTAVOS (inteiro)
// para evitar erros de ponto flutuante — especialmente na divisão de parcelas.

export type MonthKey = string; // formato "AAAA-MM", ex: "2026-08"

// income = entrada | expense = saída comum | investment = aporte (investimento)
export type ItemKind = 'income' | 'expense' | 'investment';

/**
 * Item recorrente: uma definição de entrada ou saída.
 * - fixed=true  -> aparece todo mês a partir de startMonth (até endMonth, se houver)
 * - fixed=false -> aparece apenas no mês startMonth (lançamento avulso)
 */
export interface RecurringItem {
  id: string;
  kind: ItemKind;
  name: string;
  planned: number;          // valor previsto (centavos)
  fixed: boolean;
  startMonth: MonthKey;
  endMonth: MonthKey | null; // opcional: quando o item deixa de existir
  createdAt: number;
}

/** Valor realizado de um item em um mês específico. */
export interface Actual {
  amount: number; // centavos
  paid: boolean;  // marcado como pago/recebido
}

/**
 * Compra no cartão de crédito. Fica numa "tabela" separada das saídas.
 * Cada parcela cai no seu mês, com valor já fechado.
 *
 * planned=true  -> compra PREVISTA (simulação: ainda não comprei, mas vou).
 *                  Entra na fatura prevista, não na realizada.
 * planned=false -> compra CONFIRMADA (já comprei, é real). Conta em ambas.
 */
export interface CardPurchase {
  id: string;
  description: string;
  // recurring=false: `total` é o valor TOTAL, dividido em `installments` parcelas.
  // recurring=true:  `total` é o valor MENSAL fixo, repetido todo mês (sem parcelar).
  total: number;          // centavos
  installments: number;   // usado só quando !recurring (>= 1)
  firstMonth: MonthKey;   // mês da 1ª parcela / mês inicial
  recurring: boolean;     // cobrança mensal fixa (ex: internet), sem parcelamento
  planned: boolean;
  createdAt: number;
}

/**
 * Rendimento do investimento: valor que soma ao montante (não sai do bolso).
 * Lançado por mês.
 */
export interface YieldEntry {
  id: string;
  month: MonthKey;
  amount: number;      // centavos
  description: string; // opcional (ex: "CDB", "Dividendos")
  createdAt: number;
}

/**
 * Retirada do investimento: dinheiro que sai do patrimônio investido e volta
 * para o saldo disponível da conta no mês. Reduz o montante, aumenta o saldo.
 */
export interface WithdrawalEntry {
  id: string;
  month: MonthKey;
  amount: number;      // centavos
  description: string; // opcional
  createdAt: number;
}

/** Valor realizado de uma cobrança RECORRENTE do cartão, por mês (independente). */
export interface CardActual {
  amount: number; // centavos
}

export interface AppState {
  items: RecurringItem[]; // entradas, saídas comuns e aportes (kind='investment')
  // actuals[itemId][monthKey] = valor realizado
  actuals: Record<string, Record<MonthKey, Actual>>;
  cards: CardPurchase[];
  // cardActuals[cardId][monthKey] = valor lançado de uma cobrança recorrente naquele mês.
  // Presença = mês confirmado; ausência = ainda previsto. (Só usado por cartões recorrentes.)
  cardActuals: Record<string, Record<MonthKey, CardActual>>;
  yields: YieldEntry[];
  withdrawals: WithdrawalEntry[];
}

export const emptyState: AppState = {
  items: [],
  actuals: {},
  cards: [],
  cardActuals: {},
  yields: [],
  withdrawals: [],
};
