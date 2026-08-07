import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, emptyState } from '../types';

const STORAGE_KEY = '@financas:state:v1';

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw);
    // Merge defensivo para tolerar versões antigas / campos ausentes.
    return {
      // Itens legados (com fixed/startMonth) viram lançamentos de mês único (month = startMonth).
      items: Array.isArray(parsed.items)
        ? parsed.items.map((it: any) => ({
            id: it.id,
            kind: it.kind,
            name: it.name,
            planned: it.planned,
            month: it.month ?? it.startMonth,
            createdAt: it.createdAt,
          }))
        : [],
      actuals: parsed.actuals && typeof parsed.actuals === 'object' ? parsed.actuals : {},
      // Compras antigas: `planned` default confirmado. (Campo `recurring` legado é ignorado.)
      cards: Array.isArray(parsed.cards)
        ? parsed.cards.map((c: any) => ({
            id: c.id,
            description: c.description,
            total: c.total,
            installments: c.installments ?? 1,
            firstMonth: c.firstMonth,
            planned: c.planned ?? false,
            createdAt: c.createdAt,
          }))
        : [],
      yields: Array.isArray(parsed.yields) ? parsed.yields : [],
      withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
    };
  } catch (e) {
    console.warn('Falha ao carregar estado local:', e);
    return emptyState;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Falha ao salvar estado local:', e);
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Falha ao limpar estado local:', e);
  }
}
