import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, spacing, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';

export type TabKey = 'resumo' | 'entradas' | 'saidas' | 'investir' | 'cartao';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'resumo', label: 'Resumo', icon: '◎' },
  { key: 'entradas', label: 'Entradas', icon: '↓' },
  { key: 'saidas', label: 'Saídas', icon: '↑' },
  { key: 'investir', label: 'Investir', icon: '↗' },
  { key: 'cartao', label: 'Cartão', icon: '▭' },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        const tint = isActive ? colors.accent : colors.textFaint;
        return (
          <Pressable key={t.key} style={styles.tab} onPress={() => onChange(t.key)} hitSlop={6}>
            <Text style={[styles.icon, { color: tint }]}>{t.icon}</Text>
            <Text style={[styles.label, { color: tint }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    icon: {
      fontSize: 20,
      lineHeight: 24,
    },
    label: {
      fontSize: font.size.xs,
      fontWeight: font.weight.medium,
    },
  });
