import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { CardPurchase, MonthKey } from '../types';
import { useFinance } from '../store/FinanceContext';
import {
  cardsForMonth,
  cardPlannedForMonth,
  cardRealizedForMonth,
  cardInstallmentForMonth,
  cardInstallmentIndex,
} from '../store/selectors';
import { formatBRL } from '../utils/money';
import { labelMedium } from '../utils/dates';
import { ScreenHeader } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { Card, Fab, EmptyState, SectionTitle, Divider } from '../components/ui';
import { CardFormModal } from '../components/CardFormModal';
import { SwipeToConfirm } from '../components/SwipeToConfirm';

export function CartaoScreen({
  month,
  onChangeMonth,
}: {
  month: MonthKey;
  onChangeMonth: (m: MonthKey) => void;
}) {
  const { state, updateCard } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const monthCards = cardsForMonth(state, month);
  const planned = cardPlannedForMonth(state, month);
  const realized = cardRealizedForMonth(state, month);

  const [showAdd, setShowAdd] = React.useState(false);
  const [editing, setEditing] = React.useState<CardPurchase | null>(null);

  const confirm = (c: CardPurchase) => updateCard({ ...c, planned: false });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Cartão" />

        <View style={styles.block}>
          <MonthSelector month={month} onChange={onChangeMonth} />
        </View>

        {/* Total do mês */}
        <Card style={[styles.block, styles.totalCard]}>
          <Text style={styles.totalLabel}>Fatura do mês</Text>
          <Text style={styles.totalValue}>{formatBRL(realized)}</Text>
          <Text style={styles.totalSub}>
            {planned !== realized ? `Prevista ${formatBRL(planned)} · ` : ''}
            {monthCards.length === 0
              ? 'sem parcelas'
              : `${monthCards.length} ${monthCards.length === 1 ? 'compra' : 'compras'}`}
          </Text>
        </Card>

        {/* Parcelas do mês */}
        <View style={styles.block}>
          <SectionTitle>Parcelas de {labelMedium(month)}</SectionTitle>
          <Card style={{ paddingVertical: spacing.xs }}>
            {monthCards.length === 0 ? (
              <EmptyState icon="💳" title="Nenhuma parcela neste mês" />
            ) : (
              monthCards.map((c, idx) => {
                const parc = cardInstallmentIndex(c, month);
                const val = cardInstallmentForMonth(c, month);
                return (
                  <View key={c.id}>
                    {idx > 0 ? <Divider /> : null}
                    <SwipeToConfirm
                      enabled={c.planned}
                      label="Confirmar"
                      color={colors.card}
                      onConfirm={() => confirm(c)}
                    >
                      <Pressable
                        onPress={() => setEditing(c)}
                        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}
                      >
                        <View style={{ flex: 1, paddingRight: spacing.md }}>
                          <View style={styles.rowTitleLine}>
                            <Text style={styles.rowTitle} numberOfLines={1}>
                              {c.description}
                            </Text>
                            {c.planned ? <PlannedTag /> : null}
                          </View>
                          <Text style={styles.rowMeta}>
                            Parcela {parc}/{c.installments} · Total {formatBRL(c.total)}
                          </Text>
                        </View>
                        <Text style={[styles.rowValue, { color: colors.card }]}>{formatBRL(val)}</Text>
                      </Pressable>
                    </SwipeToConfirm>
                  </View>
                );
              })
            )}
          </Card>
        </View>

        <Text style={styles.hint}>
          Compras "previstas" são simulações — arraste pra esquerda para confirmar quando comprar.
        </Text>
      </ScrollView>

      <Fab onPress={() => setShowAdd(true)} />

      <CardFormModal visible={showAdd} onClose={() => setShowAdd(false)} month={month} />
      <CardFormModal
        visible={editing !== null}
        onClose={() => setEditing(null)}
        month={month}
        editing={editing}
      />
    </View>
  );
}

function PlannedTag() {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>Previsto</Text>
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
    totalCard: {
      backgroundColor: colors.cardFill,
      borderColor: colors.cardFill,
    },
    totalLabel: {
      fontSize: font.size.sm,
      color: 'rgba(255,255,255,0.8)',
    },
    totalValue: {
      fontSize: font.size.display,
      fontWeight: font.weight.bold,
      color: colors.onFill,
      letterSpacing: -1,
      marginTop: spacing.xs,
    },
    totalSub: {
      fontSize: font.size.sm,
      color: 'rgba(255,255,255,0.8)',
      marginTop: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.sm,
    },
    rowTitleLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rowTitle: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.text,
      flexShrink: 1,
    },
    rowMeta: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: 2,
    },
    rowValue: {
      fontSize: font.size.md,
      fontWeight: font.weight.bold,
    },
    rowValueSoft: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.textSoft,
    },
    tag: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 1,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.card,
    },
    tagText: {
      fontSize: 10,
      fontWeight: font.weight.semibold,
      color: colors.card,
    },
    hint: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      textAlign: 'center',
      marginHorizontal: spacing.lg,
      marginTop: spacing.xs,
    },
  });
