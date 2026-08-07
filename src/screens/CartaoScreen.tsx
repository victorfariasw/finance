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
  cardMonthAmount,
  cardMonthConfirmed,
  cardInstallmentIndex,
} from '../store/selectors';
import { formatBRL } from '../utils/money';
import { labelMedium } from '../utils/dates';
import { ScreenHeader } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { Card, Fab, EmptyState, SectionTitle, Divider } from '../components/ui';
import { CardFormModal } from '../components/CardFormModal';
import { CardActualModal } from '../components/CardActualModal';
import { SwipeToConfirm } from '../components/SwipeToConfirm';

interface Row {
  card: CardPurchase;
  amount: number;
  confirmed: boolean;
}

export function CartaoScreen({
  month,
  onChangeMonth,
}: {
  month: MonthKey;
  onChangeMonth: (m: MonthKey) => void;
}) {
  const { state, updateCard, setCardActual } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const rows: Row[] = cardsForMonth(state, month).map((card) => ({
    card,
    amount: cardMonthAmount(state, card, month),
    confirmed: cardMonthConfirmed(state, card, month),
  }));
  const confirmadas = rows.filter((r) => r.confirmed);
  const previstas = rows.filter((r) => !r.confirmed);
  const planned = cardPlannedForMonth(state, month);
  const realized = cardRealizedForMonth(state, month);

  const [showAdd, setShowAdd] = React.useState(false);
  const [editing, setEditing] = React.useState<CardPurchase | null>(null);
  const [valueCard, setValueCard] = React.useState<CardPurchase | null>(null);

  // Confirmar: recorrente lança o valor previsto naquele mês; parcelada confirma a compra.
  const confirm = (c: CardPurchase) => {
    if (c.recurring) setCardActual(c.id, month, { amount: c.total });
    else updateCard({ ...c, planned: false });
  };
  // Toque: recorrente abre o valor do mês; parcelada abre a edição da compra.
  const press = (c: CardPurchase) => {
    if (c.recurring) setValueCard(c);
    else setEditing(c);
  };

  const renderRow = (r: Row, idx: number) => (
    <View key={r.card.id}>
      {idx > 0 ? <Divider /> : null}
      <CardMonthRow
        card={r.card}
        month={month}
        amount={r.amount}
        confirmed={r.confirmed}
        onPress={() => press(r.card)}
        onLongPress={r.card.recurring ? () => setEditing(r.card) : undefined}
        onConfirm={() => confirm(r.card)}
      />
    </View>
  );

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
            {rows.length === 0
              ? 'sem lançamentos'
              : `${rows.length} ${rows.length === 1 ? 'lançamento' : 'lançamentos'}`}
          </Text>
        </Card>

        {/* Confirmados (lançamentos reais) */}
        <View style={styles.block}>
          <SectionTitle>Lançamentos de {labelMedium(month)}</SectionTitle>
          <Card style={{ paddingVertical: spacing.xs }}>
            {confirmadas.length === 0 ? (
              <EmptyState icon="💳" title="Nenhum lançamento confirmado" />
            ) : (
              confirmadas.map(renderRow)
            )}
          </Card>
        </View>

        {/* Previstos (simulação) — só aparece se houver */}
        {previstas.length > 0 ? (
          <View style={styles.block}>
            <SectionTitle>Previstos de {labelMedium(month)}</SectionTitle>
            <Card style={{ paddingVertical: spacing.xs }}>{previstas.map(renderRow)}</Card>
          </View>
        ) : null}

        <Text style={styles.hint}>
          Toque numa recorrente para lançar o valor real do mês · Arraste pra esquerda pra confirmar
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
      <CardActualModal
        visible={valueCard !== null}
        onClose={() => setValueCard(null)}
        card={valueCard}
        month={month}
      />
    </View>
  );
}

function CardMonthRow({
  card,
  month,
  amount,
  confirmed,
  onPress,
  onLongPress,
  onConfirm,
}: {
  card: CardPurchase;
  month: MonthKey;
  amount: number;
  confirmed: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onConfirm: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const meta = card.recurring
    ? confirmed
      ? `Mensal · previsto ${formatBRL(card.total)}`
      : 'Mensal'
    : `Parcela ${cardInstallmentIndex(card, month)}/${card.installments} · Total ${formatBRL(card.total)}`;

  return (
    <SwipeToConfirm enabled={!confirmed} label="Confirmar" color={colors.card} onConfirm={onConfirm}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={280}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}
      >
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {card.description}
          </Text>
          <Text style={styles.rowMeta}>{meta}</Text>
        </View>
        <Text style={[styles.rowValue, { color: colors.card }]}>{formatBRL(amount)}</Text>
      </Pressable>
    </SwipeToConfirm>
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
    rowTitle: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.text,
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
    hint: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      textAlign: 'center',
      marginHorizontal: spacing.lg,
      marginTop: spacing.xs,
    },
  });
