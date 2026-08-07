import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useMemo,
} from 'react';
import {
  AppState,
  Actual,
  CardPurchase,
  CardActual,
  MonthKey,
  RecurringItem,
  YieldEntry,
  WithdrawalEntry,
  emptyState,
} from '../types';
import { loadState, saveState } from './storage';
import { makeId } from '../utils/id';

type Action =
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'ADD_ITEM'; item: RecurringItem }
  | { type: 'UPDATE_ITEM'; item: RecurringItem }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'SET_ACTUAL'; itemId: string; month: MonthKey; actual: Actual | null }
  | { type: 'ADD_CARD'; card: CardPurchase }
  | { type: 'UPDATE_CARD'; card: CardPurchase }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'SET_CARD_ACTUAL'; cardId: string; month: MonthKey; actual: CardActual | null }
  | { type: 'ADD_YIELD'; entry: YieldEntry }
  | { type: 'UPDATE_YIELD'; entry: YieldEntry }
  | { type: 'DELETE_YIELD'; id: string }
  | { type: 'ADD_WITHDRAWAL'; entry: WithdrawalEntry }
  | { type: 'UPDATE_WITHDRAWAL'; entry: WithdrawalEntry }
  | { type: 'DELETE_WITHDRAWAL'; id: string }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.item.id ? action.item : i)),
      };

    case 'DELETE_ITEM': {
      const actuals = { ...state.actuals };
      delete actuals[action.id];
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
        actuals,
      };
    }

    case 'SET_ACTUAL': {
      const byItem = { ...(state.actuals[action.itemId] ?? {}) };
      if (action.actual === null) {
        delete byItem[action.month];
      } else {
        byItem[action.month] = action.actual;
      }
      return {
        ...state,
        actuals: { ...state.actuals, [action.itemId]: byItem },
      };
    }

    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.card] };

    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.card.id ? action.card : c)),
      };

    case 'DELETE_CARD': {
      const cardActuals = { ...state.cardActuals };
      delete cardActuals[action.id];
      return {
        ...state,
        cards: state.cards.filter((c) => c.id !== action.id),
        cardActuals,
      };
    }

    case 'SET_CARD_ACTUAL': {
      const byMonth = { ...(state.cardActuals[action.cardId] ?? {}) };
      if (action.actual === null) {
        delete byMonth[action.month];
      } else {
        byMonth[action.month] = action.actual;
      }
      return {
        ...state,
        cardActuals: { ...state.cardActuals, [action.cardId]: byMonth },
      };
    }

    case 'ADD_YIELD':
      return { ...state, yields: [...state.yields, action.entry] };

    case 'UPDATE_YIELD':
      return {
        ...state,
        yields: state.yields.map((y) => (y.id === action.entry.id ? action.entry : y)),
      };

    case 'DELETE_YIELD':
      return { ...state, yields: state.yields.filter((y) => y.id !== action.id) };

    case 'ADD_WITHDRAWAL':
      return { ...state, withdrawals: [...state.withdrawals, action.entry] };

    case 'UPDATE_WITHDRAWAL':
      return {
        ...state,
        withdrawals: state.withdrawals.map((w) => (w.id === action.entry.id ? action.entry : w)),
      };

    case 'DELETE_WITHDRAWAL':
      return { ...state, withdrawals: state.withdrawals.filter((w) => w.id !== action.id) };

    case 'RESET':
      return emptyState;

    default:
      return state;
  }
}

interface FinanceContextValue {
  state: AppState;
  ready: boolean;
  // itens recorrentes
  addItem: (data: Omit<RecurringItem, 'id' | 'createdAt'>) => void;
  updateItem: (item: RecurringItem) => void;
  deleteItem: (id: string) => void;
  // realizado
  setActual: (itemId: string, month: MonthKey, actual: Actual | null) => void;
  // cartão
  addCard: (data: Omit<CardPurchase, 'id' | 'createdAt'>) => void;
  updateCard: (card: CardPurchase) => void;
  deleteCard: (id: string) => void;
  setCardActual: (cardId: string, month: MonthKey, actual: CardActual | null) => void;
  // rendimentos
  addYield: (data: Omit<YieldEntry, 'id' | 'createdAt'>) => void;
  updateYield: (entry: YieldEntry) => void;
  deleteYield: (id: string) => void;
  // retiradas
  addWithdrawal: (data: Omit<WithdrawalEntry, 'id' | 'createdAt'>) => void;
  updateWithdrawal: (entry: WithdrawalEntry) => void;
  deleteWithdrawal: (id: string) => void;
  reset: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const readyRef = useRef(false);
  const [ready, setReady] = React.useState(false);

  // Hidratação inicial a partir do armazenamento local.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadState();
      if (mounted) {
        dispatch({ type: 'HYDRATE', state: loaded });
        readyRef.current = true;
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persiste sempre que o estado muda (após pronto).
  useEffect(() => {
    if (readyRef.current) {
      saveState(state);
    }
  }, [state]);

  const value = useMemo<FinanceContextValue>(
    () => ({
      state,
      ready,
      addItem: (data) =>
        dispatch({ type: 'ADD_ITEM', item: { ...data, id: makeId(), createdAt: Date.now() } }),
      updateItem: (item) => dispatch({ type: 'UPDATE_ITEM', item }),
      deleteItem: (id) => dispatch({ type: 'DELETE_ITEM', id }),
      setActual: (itemId, month, actual) =>
        dispatch({ type: 'SET_ACTUAL', itemId, month, actual }),
      addCard: (data) =>
        dispatch({ type: 'ADD_CARD', card: { ...data, id: makeId(), createdAt: Date.now() } }),
      updateCard: (card) => dispatch({ type: 'UPDATE_CARD', card }),
      deleteCard: (id) => dispatch({ type: 'DELETE_CARD', id }),
      setCardActual: (cardId, month, actual) =>
        dispatch({ type: 'SET_CARD_ACTUAL', cardId, month, actual }),
      addYield: (data) =>
        dispatch({ type: 'ADD_YIELD', entry: { ...data, id: makeId(), createdAt: Date.now() } }),
      updateYield: (entry) => dispatch({ type: 'UPDATE_YIELD', entry }),
      deleteYield: (id) => dispatch({ type: 'DELETE_YIELD', id }),
      addWithdrawal: (data) =>
        dispatch({ type: 'ADD_WITHDRAWAL', entry: { ...data, id: makeId(), createdAt: Date.now() } }),
      updateWithdrawal: (entry) => dispatch({ type: 'UPDATE_WITHDRAWAL', entry }),
      deleteWithdrawal: (id) => dispatch({ type: 'DELETE_WITHDRAWAL', id }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state, ready],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance deve ser usado dentro de <FinanceProvider>');
  return ctx;
}
