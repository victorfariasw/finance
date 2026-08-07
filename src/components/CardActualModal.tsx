import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { ModalSheet } from './ModalSheet';
import { MoneyInput } from './inputs';
import { Button } from './ui';
import { Palette, spacing, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { CardPurchase, MonthKey } from '../types';
import { useFinance } from '../store/FinanceContext';
import { formatBRL } from '../utils/money';
import { labelLong } from '../utils/dates';

/** Lança/edita o valor real de uma cobrança RECORRENTE do cartão em um mês. */
export function CardActualModal({
  visible,
  onClose,
  card,
  month,
}: {
  visible: boolean;
  onClose: () => void;
  card: CardPurchase | null;
  month: MonthKey;
}) {
  const { state, setCardActual } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const existing = card ? state.cardActuals[card.id]?.[month] : undefined;
  const [amount, setAmount] = React.useState(0);

  React.useEffect(() => {
    if (!visible || !card) return;
    const cur = state.cardActuals[card.id]?.[month];
    setAmount(cur?.amount ?? card.total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, card, month]);

  if (!card) return null;

  const save = () => {
    setCardActual(card.id, month, { amount });
    onClose();
  };

  const clear = () => {
    setCardActual(card.id, month, null);
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title={card.description}>
      <Text style={styles.subtitle}>
        {labelLong(month)} · Previsto {formatBRL(card.total)}
      </Text>

      <MoneyInput label="Valor gasto neste mês" cents={amount} onChange={setAmount} accent={colors.card} />

      <Pressable style={styles.usePlanned} onPress={() => setAmount(card.total)}>
        <Text style={styles.usePlannedLabel}>Usar valor previsto ({formatBRL(card.total)})</Text>
      </Pressable>

      <Button label={existing ? 'Salvar' : 'Lançar'} onPress={save} />
      {existing ? (
        <Button label="Limpar lançamento" onPress={clear} variant="ghost" style={{ marginTop: spacing.sm }} />
      ) : null}
    </ModalSheet>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    subtitle: {
      fontSize: font.size.sm,
      color: colors.textSoft,
      marginBottom: spacing.lg,
    },
    usePlanned: {
      marginTop: -spacing.sm,
      marginBottom: spacing.lg,
      alignSelf: 'flex-start',
    },
    usePlannedLabel: {
      fontSize: font.size.sm,
      color: colors.textSoft,
      textDecorationLine: 'underline',
    },
  });
