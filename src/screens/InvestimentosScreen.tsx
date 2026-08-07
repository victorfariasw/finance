import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { MonthKey, RecurringItem, YieldEntry } from '../types';
import { useFinance } from '../store/FinanceContext';
import { itemsForMonth, getActual, montanteUpTo, yieldsForMonth, monthSummary } from '../store/selectors';
import { formatBRL } from '../utils/money';
import { labelMedium } from '../utils/dates';
import { ScreenHeader } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { Card, Fab, EmptyState, SectionTitle, Divider } from '../components/ui';
import { ItemRow } from '../components/ItemRow';
import { ItemFormModal } from '../components/ItemFormModal';
import { ActualModal } from '../components/ActualModal';
import { YieldModal } from '../components/YieldModal';

type AddTarget = 'aporte' | 'rendimento' | null;

export function InvestimentosScreen({
  month,
  onChangeMonth,
}: {
  month: MonthKey;
  onChangeMonth: (m: MonthKey) => void;
}) {
  const { state, setActual } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const aportes = itemsForMonth(state, 'investment', month);
  const yields = yieldsForMonth(state, month);
  const montante = montanteUpTo(state, month);
  const s = monthSummary(state, month);

  const [addTarget, setAddTarget] = React.useState<AddTarget>(null);
  const [editItem, setEditItem] = React.useState<RecurringItem | null>(null);
  const [valueItem, setValueItem] = React.useState<RecurringItem | null>(null);
  const [editYield, setEditYield] = React.useState<YieldEntry | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Investir" />

        <View style={styles.block}>
          <MonthSelector month={month} onChange={onChangeMonth} />
        </View>

        {/* Patrimônio / montante */}
        <Card style={[styles.block, styles.montanteCard]}>
          <Text style={styles.montanteLabel}>Patrimônio investido</Text>
          <Text style={styles.montanteValue}>{formatBRL(montante.total)}</Text>
          <Text style={styles.montanteSub}>Acumulado até {labelMedium(month)} · disponível se precisar</Text>
          <View style={styles.montanteBreak}>
            <View style={styles.breakItem}>
              <Text style={styles.breakLabel}>Aportado</Text>
              <Text style={styles.breakValue}>{formatBRL(montante.aportado)}</Text>
            </View>
            <View style={styles.breakDivider} />
            <View style={styles.breakItem}>
              <Text style={styles.breakLabel}>Rendimentos</Text>
              <Text style={styles.breakValue}>{formatBRL(montante.rendimentos)}</Text>
            </View>
          </View>
        </Card>

        {/* Resumo do mês */}
        <View style={[styles.miniRow, styles.block]}>
          <Card style={styles.mini}>
            <Text style={styles.miniLabel}>Aporte do mês</Text>
            <Text style={[styles.miniValue, { color: colors.invest }]}>{formatBRL(s.realizedAporte)}</Text>
            <Text style={styles.miniPlanned}>previsto {formatBRL(s.plannedAporte)}</Text>
          </Card>
          <Card style={styles.mini}>
            <Text style={styles.miniLabel}>Rendimento do mês</Text>
            <Text style={[styles.miniValue, { color: colors.income }]}>
              {formatBRL(yields.reduce((sum, y) => sum + y.amount, 0))}
            </Text>
            <Text style={styles.miniPlanned}>{yields.length} lançamento(s)</Text>
          </Card>
        </View>

        {/* Aportes do mês */}
        <View style={styles.block}>
          <SectionTitle right={<AddLink label="+ aporte" onPress={() => setAddTarget('aporte')} />}>
            Aportes de {labelMedium(month)}
          </SectionTitle>
          <Card>
            {aportes.length === 0 ? (
              <EmptyState
                icon="📈"
                title="Nenhum aporte neste mês"
                subtitle="O aporte é descontado do saldo do mês e soma no patrimônio."
              />
            ) : (
              aportes.map((item, idx) => (
                <View key={item.id}>
                  {idx > 0 ? <Divider /> : null}
                  <ItemRow
                    item={item}
                    actual={getActual(state, item.id, month)}
                    onPressValue={() => setValueItem(item)}
                    onLongPress={() => setEditItem(item)}
                    onQuickConfirm={() => setActual(item.id, month, { amount: item.planned, paid: true })}
                  />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Rendimentos do mês */}
        <View style={styles.block}>
          <SectionTitle right={<AddLink label="+ rendimento" onPress={() => setAddTarget('rendimento')} />}>
            Rendimentos de {labelMedium(month)}
          </SectionTitle>
          <Card>
            {yields.length === 0 ? (
              <EmptyState icon="✨" title="Nenhum rendimento lançado" />
            ) : (
              yields.map((y, idx) => (
                <View key={y.id}>
                  {idx > 0 ? <Divider /> : null}
                  <Pressable
                    onPress={() => setEditYield(y)}
                    style={({ pressed }) => [styles.yieldRow, pressed && { backgroundColor: colors.surfaceAlt }]}
                  >
                    <Text style={styles.yieldDesc} numberOfLines={1}>
                      {y.description || 'Rendimento'}
                    </Text>
                    <Text style={[styles.yieldValue, { color: colors.income }]}>+{formatBRL(y.amount)}</Text>
                  </Pressable>
                </View>
              ))
            )}
          </Card>
        </View>

        <Text style={styles.hint}>Toque num aporte para lançar o valor investido · Segure para editar</Text>
      </ScrollView>

      <Fab onPress={() => setAddTarget('aporte')} />

      <ItemFormModal
        visible={addTarget === 'aporte'}
        onClose={() => setAddTarget(null)}
        kind="investment"
        month={month}
      />
      <ItemFormModal
        visible={editItem !== null}
        onClose={() => setEditItem(null)}
        kind="investment"
        month={month}
        editing={editItem}
      />
      <ActualModal
        visible={valueItem !== null}
        onClose={() => setValueItem(null)}
        item={valueItem}
        month={month}
      />
      <YieldModal visible={addTarget === 'rendimento'} onClose={() => setAddTarget(null)} month={month} />
      <YieldModal
        visible={editYield !== null}
        onClose={() => setEditYield(null)}
        month={month}
        editing={editYield}
      />
    </View>
  );
}

function AddLink({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={styles.addLink}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: spacing.xxl * 2 },
    block: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    montanteCard: {
      backgroundColor: colors.investFill,
      borderColor: colors.investFill,
    },
    montanteLabel: {
      fontSize: font.size.sm,
      color: 'rgba(255,255,255,0.85)',
    },
    montanteValue: {
      fontSize: font.size.display,
      fontWeight: font.weight.bold,
      color: colors.onFill,
      letterSpacing: -1,
      marginTop: spacing.xs,
    },
    montanteSub: {
      fontSize: font.size.xs,
      color: 'rgba(255,255,255,0.85)',
      marginTop: spacing.xs,
    },
    montanteBreak: {
      flexDirection: 'row',
      marginTop: spacing.lg,
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderRadius: radius.md,
      padding: spacing.md,
    },
    breakItem: { flex: 1, alignItems: 'center' },
    breakDivider: {
      width: 1,
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    breakLabel: {
      fontSize: font.size.xs,
      color: 'rgba(255,255,255,0.85)',
    },
    breakValue: {
      fontSize: font.size.md,
      fontWeight: font.weight.bold,
      color: colors.onFill,
      marginTop: 2,
    },
    miniRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    mini: { flex: 1, padding: spacing.md },
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
    addLink: {
      fontSize: font.size.sm,
      fontWeight: font.weight.semibold,
      color: colors.invest,
      textTransform: 'none',
    },
    yieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.sm,
    },
    yieldDesc: {
      flex: 1,
      fontSize: font.size.md,
      fontWeight: font.weight.medium,
      color: colors.text,
      paddingRight: spacing.md,
    },
    yieldValue: {
      fontSize: font.size.md,
      fontWeight: font.weight.bold,
    },
    hint: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      textAlign: 'center',
      marginHorizontal: spacing.lg,
      marginTop: spacing.xs,
    },
  });
