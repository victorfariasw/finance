import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { ModalSheet } from './ModalSheet';
import { MoneyInput } from './inputs';
import { Button } from './ui';
import { Palette, spacing, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { MonthKey, RecurringItem } from '../types';
import { useFinance } from '../store/FinanceContext';
import { getActual } from '../store/selectors';
import { formatBRL } from '../utils/money';
import { labelLong } from '../utils/dates';
import { kindMeta } from './kindMeta';

export function ActualModal({
  visible,
  onClose,
  item,
  month,
}: {
  visible: boolean;
  onClose: () => void;
  item: RecurringItem | null;
  month: MonthKey;
}) {
  const { state, setActual } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const meta = item ? kindMeta(item.kind, colors) : null;
  const accent = meta?.color ?? colors.text;

  const existing = item ? getActual(state, item.id, month) : undefined;
  const [amount, setAmount] = React.useState(0);

  React.useEffect(() => {
    if (!visible || !item) return;
    const cur = getActual(state, item.id, month);
    setAmount(cur?.amount ?? item.planned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, item, month]);

  if (!item) return null;

  // Lançar já significa confirmado (recebido/pago/investido).
  const save = () => {
    setActual(item.id, month, { amount, paid: true });
    onClose();
  };

  const clear = () => {
    setActual(item.id, month, null);
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title={item.name}>
      <Text style={styles.subtitle}>
        {labelLong(month)} · Previsto {formatBRL(item.planned)}
      </Text>

      <MoneyInput label={meta!.actualLabel} cents={amount} onChange={setAmount} accent={accent} />

      <Pressable style={styles.usePlanned} onPress={() => setAmount(item.planned)}>
        <Text style={styles.usePlannedLabel}>Usar valor previsto ({formatBRL(item.planned)})</Text>
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
