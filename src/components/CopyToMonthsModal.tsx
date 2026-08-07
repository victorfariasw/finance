import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ModalSheet } from './ModalSheet';
import { Button } from './ui';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { MonthKey } from '../types';
import { addMonths, labelLong } from '../utils/dates';

/**
 * Seleciona meses (os 12 seguintes ao `fromMonth`) para copiar um lançamento.
 * Cada cópia é independente — quem chama implementa `onCopy`.
 */
export function CopyToMonthsModal({
  visible,
  onClose,
  fromMonth,
  title,
  accent,
  onCopy,
}: {
  visible: boolean;
  onClose: () => void;
  fromMonth: MonthKey;
  title: string;
  accent?: string;
  onCopy: (months: MonthKey[]) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const acc = accent ?? colors.accent;

  const options = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => addMonths(fromMonth, i + 1)),
    [fromMonth],
  );
  const [selected, setSelected] = React.useState<Set<MonthKey>>(new Set());

  React.useEffect(() => {
    if (visible) setSelected(new Set());
  }, [visible]);

  const toggle = (m: MonthKey) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });

  const confirm = () => {
    if (selected.size === 0) return;
    onCopy(Array.from(selected));
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title={title}>
      <Text style={styles.subtitle}>Copiar para quais meses? (próximos 12)</Text>

      {options.map((m) => {
        const on = selected.has(m);
        return (
          <Pressable
            key={m}
            onPress={() => toggle(m)}
            style={[styles.row, on && { borderColor: acc, backgroundColor: colors.surfaceAlt }]}
          >
            <Text style={styles.rowLabel}>{labelLong(m)}</Text>
            <View style={[styles.checkbox, on && { backgroundColor: acc, borderColor: acc }]}>
              {on ? <Text style={styles.check}>✓</Text> : null}
            </View>
          </Pressable>
        );
      })}

      <Button
        label={
          selected.size > 0
            ? `Copiar para ${selected.size} ${selected.size === 1 ? 'mês' : 'meses'}`
            : 'Selecione os meses'
        }
        onPress={confirm}
        disabled={selected.size === 0}
        style={{ marginTop: spacing.md }}
      />
    </ModalSheet>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    subtitle: {
      fontSize: font.size.sm,
      color: colors.textSoft,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: spacing.sm,
    },
    rowLabel: {
      fontSize: font.size.md,
      color: colors.text,
      fontWeight: font.weight.medium,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.textFaint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    check: {
      color: colors.onFill,
      fontSize: 14,
      fontWeight: font.weight.bold,
    },
  });
