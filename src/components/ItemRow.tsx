import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { Actual, RecurringItem } from '../types';
import { formatBRL } from '../utils/money';
import { kindMeta } from './kindMeta';
import { SwipeToConfirm } from './SwipeToConfirm';

export function ItemRow({
  item,
  actual,
  onPressValue,
  onLongPress,
  onQuickConfirm,
}: {
  item: RecurringItem;
  actual?: Actual;
  onPressValue: () => void;
  onLongPress: () => void;
  onQuickConfirm?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = kindMeta(item.kind, colors).color;
  const launched = actual !== undefined;
  const diff = launched ? actual!.amount - item.planned : 0;
  const canSwipe = !launched && !!onQuickConfirm;

  return (
    <SwipeToConfirm
      enabled={canSwipe}
      label={`Lançar ${formatBRL(item.planned)}`}
      color={accent}
      onConfirm={() => onQuickConfirm?.()}
    >
      <Pressable
        onPress={onPressValue}
        onLongPress={onLongPress}
        delayLongPress={280}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}
      >
      <View style={styles.left}>
        <View style={styles.nameLine}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {actual?.paid ? <View style={[styles.dot, { backgroundColor: accent }]} /> : null}
        </View>
        <Text style={styles.meta}>Previsto {formatBRL(item.planned)}</Text>
      </View>

      <View style={styles.right}>
        {launched ? (
          <>
            <Text style={[styles.value, { color: accent }]}>{formatBRL(actual!.amount)}</Text>
            {diff !== 0 ? (
              <Text style={[styles.diff, { color: diff > 0 ? colors.income : colors.expense }]}>
                {diff > 0 ? '+' : ''}
                {formatBRL(diff)}
              </Text>
            ) : (
              <Text style={styles.onPlan}>no previsto</Text>
            )}
          </>
        ) : (
          <Text style={styles.pending}>a lançar ⟵</Text>
        )}
      </View>
      </Pressable>
    </SwipeToConfirm>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.sm,
    },
    left: {
      flex: 1,
      paddingRight: spacing.md,
    },
    nameLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    name: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.text,
      flexShrink: 1,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    meta: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: 2,
    },
    right: {
      alignItems: 'flex-end',
    },
    value: {
      fontSize: font.size.md,
      fontWeight: font.weight.bold,
    },
    diff: {
      fontSize: font.size.xs,
      marginTop: 2,
      fontWeight: font.weight.medium,
    },
    onPlan: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: 2,
    },
    pending: {
      fontSize: font.size.sm,
      color: colors.textFaint,
      fontStyle: 'italic',
    },
  });
