import { Palette } from '../theme/theme';
import { ItemKind } from '../types';

export interface KindMeta {
  color: string;
  soft: string;
  title: string;       // título da tela / plural
  noun: string;        // "entrada", "saída", "aporte"
  verbActual: string;  // "recebido", "pago", "investido"
  actualLabel: string; // rótulo do campo de valor realizado
  placeholder: string;
  icon: string;
}

export function kindMeta(kind: ItemKind, colors: Palette): KindMeta {
  switch (kind) {
    case 'income':
      return {
        color: colors.income,
        soft: colors.incomeSoft,
        title: 'Entradas',
        noun: 'entrada',
        verbActual: 'recebido',
        actualLabel: 'Valor recebido',
        placeholder: 'Ex: Salário',
        icon: '💰',
      };
    case 'expense':
      return {
        color: colors.expense,
        soft: colors.expenseSoft,
        title: 'Saídas',
        noun: 'saída',
        verbActual: 'pago',
        actualLabel: 'Valor pago',
        placeholder: 'Ex: Aluguel',
        icon: '🧾',
      };
    case 'investment':
      return {
        color: colors.invest,
        soft: colors.investSoft,
        title: 'Aportes',
        noun: 'aporte',
        verbActual: 'investido',
        actualLabel: 'Valor investido',
        placeholder: 'Ex: Tesouro Direto',
        icon: '📈',
      };
  }
}
