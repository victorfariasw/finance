import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { ModalSheet } from './ModalSheet';
import { MoneyInput, TextField } from './inputs';
import { Button, Label } from './ui';
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
  onCopy,
}: {
  visible: boolean;
  onClose: () => void;
  kind: ItemKind;
  month: MonthKey;
  editing?: RecurringItem | null;
  onCopy?: (item: RecurringItem) => void;
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
  const [itemMonth, setItemMonth] = React.useState<MonthKey>(month);

  React.useEffect(() => {
    if (!visible) return;
    if (editing) {
      setName(editing.name);
      setPlanned(editing.planned);
      setItemMonth(editing.month);
    } else {
      setName('');
      setPlanned(0);
      setItemMonth(month);
    }
  }, [visible, editing, month]);

  const canSave = name.trim().length > 0 && planned > 0;

  const save = () => {
    if (!canSave) return;
    if (editing) {
      updateItem({ ...editing, name: name.trim(), planned, month: itemMonth });
    } else {
      addItem({ kind, name: name.trim(), planned, month: itemMonth });
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
    Alert.alert('Excluir', `Excluir "${editing.name}"? O valor lançado também será apagado.`, [
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
        <Label>Mês</Label>
        <View style={styles.monthPicker}>
          <Pressable style={styles.monthArrow} onPress={() => setItemMonth(addMonths(itemMonth, -1))}>
            <Text style={styles.monthArrowLabel}>‹</Text>
          </Pressable>
          <Text style={styles.monthText}>{labelLong(itemMonth)}</Text>
          <Pressable style={styles.monthArrow} onPress={() => setItemMonth(addMonths(itemMonth, 1))}>
            <Text style={styles.monthArrowLabel}>›</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>Para repetir em outros meses, use “Copiar para outros meses”.</Text>
      </View>

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
