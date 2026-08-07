import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { formatBRL, formatBRLShort } from '../utils/money';
import { MonthKey } from '../types';
import { labelShort } from '../utils/dates';

/**
 * Comparativo previsto x realizado para Entradas e Saídas.
 * Barras horizontais: previsto (translúcida) e realizado (cheia).
 */
export function CompareBars({
  plannedIncome,
  realizedIncome,
  plannedExpense,
  realizedExpense,
}: {
  plannedIncome: number;
  realizedIncome: number;
  plannedExpense: number;
  realizedExpense: number;
}) {
  const { colors } = useTheme();
  const max = Math.max(plannedIncome, realizedIncome, plannedExpense, realizedExpense, 1);

  return (
    <View style={{ gap: spacing.lg }}>
      <BarGroup title="Entradas" color={colors.income} planned={plannedIncome} realized={realizedIncome} max={max} />
      <BarGroup title="Saídas" color={colors.expense} planned={plannedExpense} realized={realizedExpense} max={max} />
    </View>
  );
}

function BarGroup({
  title,
  color,
  planned,
  realized,
  max,
}: {
  title: string;
  color: string;
  planned: number;
  realized: number;
  max: number;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{title}</Text>
      </View>

      <BarLine label="Previsto" value={planned} max={max} fill={color} fillOpacity={0.28} soft />
      <View style={{ height: 6 }} />
      <BarLine label="Realizado" value={realized} max={max} fill={color} fillOpacity={1} />
    </View>
  );
}

function BarLine({
  label,
  value,
  max,
  fill,
  fillOpacity,
  soft,
}: {
  label: string;
  value: number;
  max: number;
  fill: string;
  fillOpacity: number;
  soft?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pct = Math.max(0.02, value / max);
  return (
    <View style={styles.barLine}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: fill, opacity: fillOpacity }]} />
      </View>
      <Text style={[styles.barValue, { color: soft ? colors.textSoft : colors.text }]}>{formatBRL(value)}</Text>
    </View>
  );
}

/**
 * Projeção de saldo previsto ao longo de vários meses.
 * Barras verticais, positivas (verde) ou negativas (vermelho).
 */
export function ProjectionChart({
  data,
  activeMonth,
  onSelectMonth,
}: {
  data: { month: MonthKey; saldo: number }[];
  activeMonth: MonthKey;
  onSelectMonth?: (m: MonthKey) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.saldo)));
  const H = 90;

  return (
    <View>
      <View style={[styles.projRow, { height: H }]}>
        {data.map((d) => {
          const ratio = Math.abs(d.saldo) / maxAbs;
          const h = Math.max(4, ratio * (H / 2 - 6));
          const positive = d.saldo >= 0;
          const active = d.month === activeMonth;
          const barColor = positive ? colors.income : colors.expense;
          return (
            <Pressable
              key={d.month}
              style={styles.projCol}
              onPress={onSelectMonth ? () => onSelectMonth(d.month) : undefined}
            >
              <View style={styles.projHalfTop}>
                {positive ? (
                  <View style={[styles.projBar, { height: h, backgroundColor: barColor, opacity: active ? 1 : 0.35 }]} />
                ) : null}
              </View>
              <View style={styles.projZero} />
              <View style={styles.projHalfBottom}>
                {!positive ? (
                  <View style={[styles.projBarBottom, { height: h, backgroundColor: barColor, opacity: active ? 1 : 0.35 }]} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.projLabels}>
        {data.map((d) => (
          <View key={d.month} style={styles.projLabelCol}>
            <Text style={[styles.projLabel, d.month === activeMonth && styles.projLabelActive]}>
              {labelShort(d.month)}
            </Text>
            <Text style={[styles.projValue, d.saldo < 0 && { color: colors.expense }]}>
              {formatBRLShort(d.saldo)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    groupHeader: {
      marginBottom: spacing.sm,
    },
    groupTitle: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.text,
    },
    barLine: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    barLabel: {
      width: 66,
      fontSize: font.size.xs,
      color: colors.textFaint,
    },
    barTrack: {
      flex: 1,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: radius.pill,
    },
    barValue: {
      width: 96,
      textAlign: 'right',
      fontSize: font.size.sm,
      fontWeight: font.weight.semibold,
    },
    projRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    projCol: {
      flex: 1,
      alignItems: 'center',
    },
    projHalfTop: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    projHalfBottom: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    projZero: {
      height: 1,
      width: '70%',
      backgroundColor: colors.divider,
    },
    projBar: {
      width: 14,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    projBarBottom: {
      width: 14,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    },
    projLabels: {
      flexDirection: 'row',
      marginTop: spacing.sm,
    },
    projLabelCol: {
      flex: 1,
      alignItems: 'center',
    },
    projLabel: {
      fontSize: font.size.xs,
      color: colors.textFaint,
    },
    projLabelActive: {
      color: colors.text,
      fontWeight: font.weight.bold,
    },
    projValue: {
      fontSize: 10,
      color: colors.textSoft,
      marginTop: 1,
    },
  });
