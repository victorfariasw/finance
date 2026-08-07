import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { ModalSheet } from './ModalSheet';
import { MoneyInput, TextField, NumberField } from './inputs';
import { Button, Label, Chip } from './ui';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { CardPurchase, MonthKey } from '../types';
import { useFinance } from '../store/FinanceContext';
import { addMonths, labelLong, labelMedium } from '../utils/dates';
import { installmentAmount, formatBRL } from '../utils/money';

export function CardFormModal({
  visible,
  onClose,
  month,
  editing,
  onCopy,
}: {
  visible: boolean;
  onClose: () => void;
  month: MonthKey;
  editing?: CardPurchase | null;
  onCopy?: (card: CardPurchase) => void;
}) {
  const { addCard, updateCard, deleteCard } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [description, setDescription] = React.useState('');
  const [total, setTotal] = React.useState(0);
  const [installments, setInstallments] = React.useState(1);
  const [firstMonth, setFirstMonth] = React.useState<MonthKey>(month);
  const [planned, setPlanned] = React.useState(false);

  React.useEffect(() => {
    if (!visible) return;
    if (editing) {
      setDescription(editing.description);
      setTotal(editing.total);
      setInstallments(editing.installments);
      setFirstMonth(editing.firstMonth);
      setPlanned(editing.planned);
    } else {
      setDescription('');
      setTotal(0);
      setInstallments(1);
      setFirstMonth(month);
      setPlanned(false);
    }
  }, [visible, editing, month]);

  const canSave = description.trim().length > 0 && total > 0 && installments >= 1;
  const perInstallment = installments >= 1 ? installmentAmount(total, installments, 0) : 0;
  const lastMonth = addMonths(firstMonth, installments - 1);

  const save = () => {
    if (!canSave) return;
    const data = { description: description.trim(), total, installments, firstMonth, planned };
    if (editing) {
      updateCard({ ...editing, ...data });
    } else {
      addCard(data);
    }
    onClose();
  };

  const copy = () => {
    if (!editing || !onCopy) return;
    onClose();
    onCopy(editing);
  };

  const remove = () => {
    if (!editing) return;
    Alert.alert('Excluir', `Excluir "${editing.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteCard(editing.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title={editing ? 'Editar compra' : 'Nova compra no cartão'}>
      <TextField label="Descrição" value={description} onChange={setDescription} placeholder="Ex: PetLove" />

      <MoneyInput label="Valor total" cents={total} onChange={setTotal} accent={colors.card} />

      <NumberField label="Parcelas" value={installments} onChange={setInstallments} suffix="x" />

      <View style={styles.field}>
        <Label>Situação</Label>
        <View style={styles.chips}>
          <Chip label="Já comprei" active={!planned} onPress={() => setPlanned(false)} color={colors.card} />
          <Chip label="Previsto (simulação)" active={planned} onPress={() => setPlanned(true)} color={colors.card} />
        </View>
      </View>

      <View style={styles.field}>
        <Label>1ª parcela em</Label>
        <View style={styles.monthPicker}>
          <Pressable style={styles.monthArrow} onPress={() => setFirstMonth(addMonths(firstMonth, -1))}>
            <Text style={styles.monthArrowLabel}>‹</Text>
          </Pressable>
          <Text style={styles.monthText}>{labelLong(firstMonth)}</Text>
          <Pressable style={styles.monthArrow} onPress={() => setFirstMonth(addMonths(firstMonth, 1))}>
            <Text style={styles.monthArrowLabel}>›</Text>
          </Pressable>
        </View>
      </View>

      {total > 0 && installments >= 1 ? (
        <View style={styles.preview}>
          <Text style={styles.previewMain}>
            {installments}x de {formatBRL(perInstallment)}
          </Text>
          <Text style={styles.previewSub}>
            {installments === 1
              ? `Cai em ${labelMedium(firstMonth)}`
              : `De ${labelMedium(firstMonth)} até ${labelMedium(lastMonth)}`}
          </Text>
        </View>
      ) : null}

      <Button label="Salvar" onPress={save} disabled={!canSave} />
      {editing && onCopy ? (
        <Button
          label="Copiar para outros meses"
          onPress={copy}
          variant="ghost"
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
      {editing ? (
        <Button label="Excluir" onPress={remove} variant="danger" style={{ marginTop: spacing.sm }} />
      ) : null}
    </ModalSheet>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    field: {
      marginBottom: spacing.lg,
    },
    chips: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    monthPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.xs,
    },
    monthArrow: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthArrowLabel: {
      fontSize: 24,
      color: colors.text,
    },
    monthText: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.text,
    },
    preview: {
      backgroundColor: colors.cardSoft,
      borderRadius: radius.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
    previewMain: {
      fontSize: font.size.xl,
      fontWeight: font.weight.bold,
      color: colors.card,
    },
    previewSub: {
      fontSize: font.size.sm,
      color: colors.textSoft,
      marginTop: spacing.xs,
    },
  });
