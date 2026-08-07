import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Palette, ThemeMode, lightColors, darkColors } from '../theme/theme';

const THEME_KEY = '@financas:theme:v1';

interface ThemeContextValue {
  colors: Palette;
  scheme: 'light' | 'dark'; // esquema efetivo aplicado
  mode: ThemeMode;          // preferência do usuário
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Carrega a preferência salva.
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      } catch {
        // mantém default
      }
    })();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m).catch(() => {});
  };

  const scheme: 'light' | 'dark' = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, scheme, mode, setMode }),
    [colors, scheme, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}

/** Cria estilos temáticos memoizados a partir de uma fábrica que recebe a paleta. */
export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
