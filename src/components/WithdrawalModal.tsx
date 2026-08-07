import React from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { ModalSheet } from './ModalSheet';
import { MoneyInput, TextField } from './inputs';
import { Button } from './ui';
import { Palette, spacing, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { MonthKey, WithdrawalEntry } from '../types';
import { useFinance } from '../store/FinanceContext';
import { montanteUpTo } from '../store/selectors';
import { formatBRL } from '../utils/money';
import { labelLong } from '../utils/dates';

export function WithdrawalModal({
  visible,
  onClose,
  month,
  editing,
}: {
  visible: boolean;
  onClose: () => void;
  month: MonthKey;
  editing?: WithdrawalEntry | null;
}) {
  const { state, addWithdrawal, updateWithdrawal, deleteWithdrawal } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const disponivel = montanteUpTo(state, month).total;

  const [amount, setAmount] = React.useState(0);
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (!visible) return;
    if (editing) {
      setAmount(editing.amount);
      setDescription(editing.description);
    } else {
      setAmount(0);
      setDescription('');
    }
  }, [visible, editing]);

  const canSave = amount > 0;

  const save = () => {
    if (!canSave) return;
    if (editing) {
      updateWithdrawal({ ...editing, amount, description: description.trim() });
    } else {
      addWithdrawal({ month, amount, description: description.trim() });
    }
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    Alert.alert('Excluir', 'Excluir esta retirada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteWithdrawal(editing.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={editing ? 'Editar retirada' : `Retirada · ${labelLong(month)}`}
    >
      <Text style={styles.subtitle}>Patrimônio disponível: {formatBRL(disponivel)}</Text>

      <MoneyInput label="Valor da retirada" cents={amount} onChange={setAmount} accent={colors.income} />
      <TextField
        label="Descrição (opcional)"
        value={description}
        onChange={setDescription}
        placeholder="Ex: emergência, viagem..."
      />

      <Text style={styles.hint}>
        Sai do patrimônio investido e entra como saldo disponível neste mês.
      </Text>

      <Button label="Salvar" onPress={save} disabled={!canSave} />
      {editing ? (
        <Button label="Excluir" onPress={remove} variant="danger" style={{ marginTop: spacing.sm }} />
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
    hint: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginBottom: spacing.lg,
    },
  });
