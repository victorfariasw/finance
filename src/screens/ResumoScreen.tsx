import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { MonthKey } from '../types';
import { useFinance } from '../store/FinanceContext';
import { monthSummary, montanteUpTo } from '../store/selectors';
import { formatBRL } from '../utils/money';
import { addMonths } from '../utils/dates';
import { ScreenHeader } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { Card, SectionTitle } from '../components/ui';
import { CompareBars, ProjectionChart } from '../components/charts';
import { ThemeToggle } from '../components/ThemeToggle';

export function ResumoScreen({
  month,
  onChangeMonth,
}: {
  month: MonthKey;
  onChangeMonth: (m: MonthKey) => void;
}) {
  const { state } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const s = monthSummary(state, month);
  const montante = montanteUpTo(state, month);

  const projection = React.useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = addMonths(month, i);
      return { month: m, saldo: monthSummary(state, m).saldoPrevisto };
    });
  }, [state, month]);

  const saldoColor = s.saldoPrevisto >= 0 ? colors.income : colors.expense;
  const realizadoColor = s.saldoRealizado >= 0 ? colors.income : colors.expense;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Resumo" right={<ThemeToggle />} />

      <View style={styles.block}>
        <MonthSelector month={month} onChange={onChangeMonth} />
      </View>

      {/* Saldo do mês */}
      <Card style={styles.block}>
        <Text style={styles.saldoLabel}>Saldo previsto</Text>
        <Text style={[styles.saldoValue, { color: saldoColor }]}>{formatBRL(s.saldoPrevisto)}</Text>
        <View style={styles.saldoRealizadoRow}>
          <Text style={styles.saldoRealizadoLabel}>Saldo realizado</Text>
          <Text style={[styles.saldoRealizadoValue, { color: realizadoColor }]}>
            {formatBRL(s.saldoRealizado)}
          </Text>
        </View>
      </Card>

      {/* Mini cards */}
      <View style={[styles.miniRow, styles.block]}>
        <MiniStat label="Entradas" value={s.realizedIncome} planned={s.plannedIncome} color={colors.income} />
        <MiniStat label="Saídas" value={s.realizedExpense} planned={s.plannedExpense} color={colors.expense} />
      </View>

      {/* Linha do cartão (separada) */}
      <Card style={styles.block}>
        <View style={styles.cardLine}>
          <View style={styles.cardLineLeft}>
            <View style={[styles.cardBadge, { backgroundColor: colors.cardSoft }]}>
              <Text style={styles.cardBadgeIcon}>💳</Text>
            </View>
            <View>
              <Text style={styles.cardLineTitle}>Cartão de crédito</Text>
              <Text style={styles.cardLineSub}>Fatura do mês</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.cardLineValue, { color: colors.card }]}>{formatBRL(s.cardRealized)}</Text>
            {s.cardPlanned !== s.cardRealized ? (
              <Text style={styles.cardLineSub}>previsto {formatBRL(s.cardPlanned)}</Text>
            ) : null}
          </View>
        </View>
      </Card>

      {/* Linha de investimento (separada) */}
      <Card style={styles.block}>
        <View style={styles.cardLine}>
          <View style={styles.cardLineLeft}>
            <View style={[styles.cardBadge, { backgroundColor: colors.investSoft }]}>
              <Text style={styles.cardBadgeIcon}>📈</Text>
            </View>
            <View>
              <Text style={styles.cardLineTitle}>Investimento</Text>
              <Text style={styles.cardLineSub}>Patrimônio {formatBRL(montante.total)}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.cardLineValue, { color: colors.invest }]}>{formatBRL(s.realizedAporte)}</Text>
            <Text style={styles.cardLineSub}>aporte do mês</Text>
          </View>
        </View>
      </Card>

      {/* Gráfico previsto x realizado */}
      <Card style={styles.block}>
        <SectionTitle>Previsto × Realizado</SectionTitle>
        <View style={{ height: spacing.sm }} />
        <CompareBars
          plannedIncome={s.plannedIncome}
          realizedIncome={s.realizedIncome}
          plannedExpense={s.plannedExpense}
          realizedExpense={s.realizedExpense}
        />
      </Card>

      {/* Projeção */}
      <Card style={styles.block}>
        <SectionTitle>Projeção de saldo (6 meses)</SectionTitle>
        <View style={{ height: spacing.md }} />
        <ProjectionChart data={projection} activeMonth={month} onSelectMonth={onChangeMonth} />
      </Card>
    </ScrollView>
  );
}

function MiniStat({
  label,
  value,
  planned,
  color,
}: {
  label: string;
  value: number;
  planned: number;
  color: string;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Card style={styles.mini}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={[styles.miniValue, { color }]}>{formatBRL(value)}</Text>
      <Text style={styles.miniPlanned}>previsto {formatBRL(planned)}</Text>
    </Card>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    content: {
      paddingBottom: spacing.xxl * 2,
    },
    block: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    saldoLabel: {
      fontSize: font.size.sm,
      color: colors.textSoft,
    },
    saldoValue: {
      fontSize: font.size.display,
      fontWeight: font.weight.bold,
      letterSpacing: -1,
      marginTop: spacing.xs,
    },
    saldoRealizadoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    saldoRealizadoLabel: {
      fontSize: font.size.sm,
      color: colors.textSoft,
    },
    saldoRealizadoValue: {
      fontSize: font.size.lg,
      fontWeight: font.weight.bold,
    },
    miniRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    mini: {
      flex: 1,
      padding: spacing.md,
    },
    miniLabel: {
      fontSize: font.size.sm,
      color: colors.textSoft,
    },
    miniValue: {
      fontSize: font.size.xl,
      fontWeight: font.weight.bold,
      marginTop: spacing.xs,
    },
    miniPlanned: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: 2,
    },
    cardLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardLineLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardBadge: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBadgeIcon: {
      fontSize: 18,
    },
    cardLineTitle: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.text,
    },
    cardLineSub: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: 2,
    },
    cardLineValue: {
      fontSize: font.size.xl,
      fontWeight: font.weight.bold,
    },
  });
