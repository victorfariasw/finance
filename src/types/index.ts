// Modelos de dados. Todos os valores monetários são armazenados em CENTAVOS (inteiro)
// para evitar erros de ponto flutuante — especialmente na divisão de parcelas.

export type MonthKey = string; // formato "AAAA-MM", ex: "2026-08"

// income = entrada | expense = saída comum | investment = aporte (investimento)
export type ItemKind = 'income' | 'expense' | 'investment';

/**
 * Lançamento de entrada, saída ou aporte — pertence a um ÚNICO mês.
 * Sem recorrência: para repetir em outros meses, usa-se "copiar para outros meses"
 * (cria cópias independentes).
 */
export interface RecurringItem {
  id: string;
  kind: ItemKind;
  name: string;
  planned: number;   // valor previsto (centavos)
  month: MonthKey;   // mês ao qual o lançamento pertence
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
  total: number;          // valor total da compra (centavos)
  installments: number;   // quantidade de parcelas (>= 1)
  firstMonth: MonthKey;   // mês da 1ª parcela
  planned: boolean;       // true = previsto (simulação); false = confirmado (real)
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

export interface AppState {
  items: RecurringItem[]; // entradas, saídas comuns e aportes (kind='investment')
  // actuals[itemId][monthKey] = valor realizado
  actuals: Record<string, Record<MonthKey, Actual>>;
  cards: CardPurchase[];
  yields: YieldEntry[];
  withdrawals: WithdrawalEntry[];
}

export const emptyState: AppState = {
  items: [],
  actuals: {},
  cards: [],
  yields: [],
  withdrawals: [],
};
