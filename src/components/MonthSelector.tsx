import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useThemedStyles } from '../store/ThemeContext';
import { MonthKey } from '../types';
import { addMonths, labelLong, currentMonthKey, monthsBetween } from '../utils/dates';

export function MonthSelector({
  month,
  onChange,
}: {
  month: MonthKey;
  onChange: (m: MonthKey) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const diff = monthsBetween(currentMonthKey(), month);
  const relative =
    diff === 0 ? 'Mês atual' : diff > 0 ? `Daqui a ${diff} ${diff === 1 ? 'mês' : 'meses'}` : `${-diff} ${-diff === 1 ? 'mês' : 'meses'} atrás`;

  return (
    <View style={styles.row}>
      <Pressable style={styles.arrow} onPress={() => onChange(addMonths(month, -1))} hitSlop={8}>
        <Text style={styles.arrowLabel}>‹</Text>
      </Pressable>

      <Pressable style={styles.center} onPress={() => onChange(currentMonthKey())}>
        <Text style={styles.month}>{labelLong(month)}</Text>
        <Text style={styles.relative}>{relative}</Text>
      </Pressable>

      <Pressable style={styles.arrow} onPress={() => onChange(addMonths(month, 1))} hitSlop={8}>
        <Text style={styles.arrowLabel}>›</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    arrow: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowLabel: {
      fontSize: 24,
      lineHeight: 26,
      color: colors.text,
      fontWeight: font.weight.medium,
    },
    center: {
      flex: 1,
      alignItems: 'center',
    },
    month: {
      fontSize: font.size.lg,
      fontWeight: font.weight.bold,
      color: colors.text,
    },
    relative: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: 2,
    },
  });
