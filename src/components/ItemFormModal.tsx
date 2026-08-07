import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { ModalSheet } from './ModalSheet';
import { MoneyInput, TextField } from './inputs';
import { Button, Chip, Label } from './ui';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { ItemKind, MonthKey, RecurringItem } from '../types';
import { useFinance } from '../store/FinanceContext';
import { addMonths, labelLong } from '../utils/dates';
import { kindMeta } from './kindMeta';

export function ItemFormModal({
  visible,
  onClose,
  kind,
  month,
  editing,
}: {
  visible: boolean;
  onClose: () => void;
  kind: ItemKind;
  month: MonthKey;
  editing?: RecurringItem | null;
}) {
  const { addItem, updateItem, deleteItem } = useFinance();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const meta = kindMeta(kind, colors);
  const accent = meta.color;
  const noun = meta.noun;
  const article = kind === 'investment' ? 'novo' : 'nova';

  const [name, setName] = React.useState('');
  const [planned, setPlanned] = React.useState(0);
  const [fixed, setFixed] = React.useState(true);
  const [startMonth, setStartMonth] = React.useState<MonthKey>(month);

  React.useEffect(() => {
    if (!visible) return;
    if (editing) {
      setName(editing.name);
      setPlanned(editing.planned);
      setFixed(editing.fixed);
      setStartMonth(editing.startMonth);
    } else {
      setName('');
      setPlanned(0);
      setFixed(true);
      setStartMonth(month);
    }
  }, [visible, editing, month]);

  const canSave = name.trim().length > 0 && planned > 0;

  const save = () => {
    if (!canSave) return;
    if (editing) {
      updateItem({ ...editing, name: name.trim(), planned, fixed, startMonth });
    } else {
      addItem({ kind, name: name.trim(), planned, fixed, startMonth, endMonth: null });
    }
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    Alert.alert('Excluir', `Excluir "${editing.name}"? Os valores lançados também serão apagados.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteItem(editing.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={editing ? `Editar ${noun}` : `${article === 'novo' ? 'Novo' : 'Nova'} ${noun}`}
    >
      <TextField label="Descrição" value={name} onChange={setName} placeholder={meta.placeholder} />

      <MoneyInput label="Valor previsto" cents={planned} onChange={setPlanned} accent={accent} />

      <View style={styles.field}>
        <Label>Recorrência</Label>
        <View style={styles.chips}>
          <Chip label="Fixo (todo mês)" active={fixed} onPress={() => setFixed(true)} color={accent} />
          <Chip label="Avulso (só um mês)" active={!fixed} onPress={() => setFixed(false)} color={accent} />
        </View>
      </View>

      <View style={styles.field}>
        <Label>{fixed ? 'A partir de' : 'No mês de'}</Label>
        <View style={styles.monthPicker}>
          <Pressable style={styles.monthArrow} onPress={() => setStartMonth(addMonths(startMonth, -1))}>
            <Text style={styles.monthArrowLabel}>‹</Text>
          </Pressable>
          <Text style={styles.monthText}>{labelLong(startMonth)}</Text>
          <Pressable style={styles.monthArrow} onPress={() => setStartMonth(addMonths(startMonth, 1))}>
            <Text style={styles.monthArrowLabel}>›</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>
          {fixed
            ? 'Vai aparecer todos os meses a partir desta data.'
            : 'Vai aparecer apenas neste mês.'}
        </Text>
      </View>

      <Button label="Salvar" onPress={save} disabled={!canSave} />
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
    hint: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: spacing.xs,
    },
  });
