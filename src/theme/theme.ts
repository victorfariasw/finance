// Tema centralizado. As cores agora vêm em duas paletas (clara/escura) e são
// consumidas via ThemeProvider/useTheme — não importe `colors` diretamente.
// spacing/radius/font/shadow são independentes de tema.

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  divider: string;

  text: string;
  textSoft: string;
  textFaint: string;

  income: string;
  incomeSoft: string;
  expense: string;
  expenseSoft: string;
  card: string;       // roxo (texto/linhas sobre superfícies)
  cardSoft: string;
  cardFill: string;   // fundo do card colorido (fatura)
  invest: string;     // azul (texto/linhas sobre superfícies)
  investSoft: string;
  investFill: string; // fundo do card colorido (patrimônio)

  accent: string;     // ações neutras (botões/FAB/abas)
  onAccent: string;   // texto sobre accent
  onFill: string;     // texto sobre fundos coloridos saturados (sempre claro)
  positive: string;
  negative: string;
}

export const lightColors: Palette = {
  bg: '#F7F7F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F2F4',
  border: '#ECECEF',
  divider: '#F0F0F2',

  text: '#16161A',
  textSoft: '#6B6B72',
  textFaint: '#9A9AA2',

  income: '#1FA971',
  incomeSoft: '#E6F6EF',
  expense: '#E5544B',
  expenseSoft: '#FDECEA',
  card: '#6C63FF',
  cardSoft: '#ECEBFF',
  cardFill: '#6C63FF',
  invest: '#2E7DF6',
  investSoft: '#E6EFFE',
  investFill: '#2E7DF6',

  accent: '#16161A',
  onAccent: '#FFFFFF',
  onFill: '#FFFFFF',
  positive: '#1FA971',
  negative: '#E5544B',
};

export const darkColors: Palette = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceAlt: '#24242B',
  border: '#2C2C34',
  divider: '#26262D',

  text: '#F3F3F5',
  textSoft: '#A2A2AC',
  textFaint: '#6C6C77',

  income: '#35D399',
  incomeSoft: '#15291F',
  expense: '#FF6B61',
  expenseSoft: '#2C1917',
  card: '#8E86FF',
  cardSoft: '#211F31',
  cardFill: '#5A51E0',
  invest: '#5B9BFF',
  investSoft: '#17233C',
  investFill: '#2E6FE0',

  accent: '#F3F3F5',
  onAccent: '#16161A',
  onFill: '#FFFFFF',
  positive: '#35D399',
  negative: '#FF6B61',
};

export type ThemeMode = 'system' | 'light' | 'dark';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const font = {
  size: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 30,
    display: 38,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
};
