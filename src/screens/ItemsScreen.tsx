import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Palette, spacing, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { ItemKind, MonthKey, RecurringItem } from '../types';
import { useFinance } from '../store/FinanceContext';
import { itemsForMonth, getActual, monthSummary } from '../store/selectors';
import { formatBRL } from '../utils/money';
import { ScreenHeader } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { Card, Fab, EmptyState, Divider } from '../components/ui';
import { ItemRow } from '../components/ItemRow';
import { ItemFormModal } from '../components/ItemFormModal';
import { ActualModal } from '../components/ActualModal';

export function ItemsScreen({
  kind,
  month,
  onChangeMonth,
}: {
  kind: ItemKind;
  month: MonthKey;
  onChangeMonth: (m: MonthKey) => void;
}) {
  const { state, setActual } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const items = itemsForMonth(state, kind, month);
  const s = monthSummary(state, month);

  const isIncome = kind === 'income';
  const title = isIncome ? 'Entradas' : 'Saídas';
  const accent = isIncome ? colors.income : colors.expense;
  const planned = isIncome ? s.plannedIncome : s.plannedExpense - s.cardPlanned;
  const realized = isIncome ? s.realizedIncome : s.realizedExpense - s.cardRealized;

  const [showAdd, setShowAdd] = React.useState(false);
  const [editing, setEditing] = React.useState<RecurringItem | null>(null);
  const [valueItem, setValueItem] = React.useState<RecurringItem | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={title} />

        <View style={styles.block}>
          <MonthSelector month={month} onChange={onChangeMonth} />
        </View>

        {/* Totais */}
        <Card style={styles.block}>
          <View style={styles.totalsRow}>
            <View>
              <Text style={styles.totalsLabel}>Realizado</Text>
              <Text style={[styles.totalsValue, { color: accent }]}>{formatBRL(realized)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalsLabel}>Previsto</Text>
              <Text style={styles.totalsPlanned}>{formatBRL(planned)}</Text>
            </View>
          </View>
          {!isIncome && s.cardPlanned > 0 ? (
            <Text style={styles.cardNote}>+ {formatBRL(s.cardPlanned)} previsto em cartão (aba Cartão)</Text>
          ) : null}
        </Card>

        {/* Lista */}
        <Card style={styles.block}>
          {items.length === 0 ? (
            <EmptyState
              icon={isIncome ? '💰' : '🧾'}
              title={isIncome ? 'Nenhuma entrada neste mês' : 'Nenhuma saída neste mês'}
              subtitle={`Toque em + para adicionar. Marque como fixo para repetir todos os meses.`}
            />
          ) : (
            items.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 ? <Divider /> : null}
                <ItemRow
                  item={item}
                  actual={getActual(state, item.id, month)}
                  onPressValue={() => setValueItem(item)}
                  onLongPress={() => setEditing(item)}
                  onQuickConfirm={() => setActual(item.id, month, { amount: item.planned, paid: true })}
                />
              </View>
            ))
          )}
        </Card>

        <Text style={styles.hint}>Toque numa linha para lançar o valor do mês · Segure para editar</Text>
      </ScrollView>

      <Fab onPress={() => setShowAdd(true)} />

      <ItemFormModal visible={showAdd} onClose={() => setShowAdd(false)} kind={kind} month={month} />
      <ItemFormModal
        visible={editing !== null}
        onClose={() => setEditing(null)}
        kind={kind}
        month={month}
        editing={editing}
      />
      <ActualModal
        visible={valueItem !== null}
        onClose={() => setValueItem(null)}
        item={valueItem}
        month={month}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingBottom: spacing.xxl * 2,
    },
    block: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    totalsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    totalsLabel: {
      fontSize: font.size.sm,
      color: colors.textSoft,
    },
    totalsValue: {
      fontSize: font.size.xxl,
      fontWeight: font.weight.bold,
      marginTop: 2,
    },
    totalsPlanned: {
      fontSize: font.size.lg,
      fontWeight: font.weight.semibold,
      color: colors.textSoft,
      marginTop: 2,
    },
    cardNote: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: spacing.md,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    hint: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      textAlign: 'center',
      marginHorizontal: spacing.lg,
      marginTop: spacing.xs,
    },
  });
