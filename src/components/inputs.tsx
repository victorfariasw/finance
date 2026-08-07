import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { digitsToCents, centsToDigits, formatBRL } from '../utils/money';
import { Label } from './ui';

/** Campo monetário estilo "caixa eletrônico": digita centavos, mostra formatado. */
export function MoneyInput({
  label,
  cents,
  onChange,
  accent,
  autoFocus,
}: {
  label?: string;
  cents: number;
  onChange: (cents: number) => void;
  accent?: string;
  autoFocus?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accentColor = accent ?? colors.text;
  const [digits, setDigits] = React.useState(cents ? centsToDigits(cents) : '');

  React.useEffect(() => {
    setDigits(cents ? centsToDigits(cents) : '');
  }, [cents]);

  const handle = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, 12);
    setDigits(clean);
    onChange(digitsToCents(clean));
  };

  return (
    <View style={styles.field}>
      {label ? <Label>{label}</Label> : null}
      <View style={styles.moneyBox}>
        <Text style={[styles.moneyValue, { color: accentColor }]}>{formatBRL(digitsToCents(digits))}</Text>
        <TextInput
          value={digits}
          onChangeText={handle}
          keyboardType="number-pad"
          autoFocus={autoFocus}
          style={styles.hiddenInput}
          caretHidden
        />
      </View>
    </View>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.field}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        autoFocus={autoFocus}
        style={styles.input}
      />
    </View>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 1,
  max = 360,
  suffix,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const styles = useThemedStyles(makeStyles);
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <View style={styles.field}>
      {label ? <Label>{label}</Label> : null}
      <View style={styles.stepper}>
        <Pressable onPress={dec} style={styles.stepBtn}>
          <Text style={styles.stepBtnLabel}>−</Text>
        </Pressable>
        <View style={styles.stepValueBox}>
          <TextInput
            value={String(value)}
            onChangeText={(t) => {
              const n = parseInt(t.replace(/\D/g, '') || '0', 10);
              onChange(Math.max(min, Math.min(max, n)));
            }}
            keyboardType="number-pad"
            style={styles.stepValue}
          />
          {suffix ? <Text style={styles.stepSuffix}>{suffix}</Text> : null}
        </View>
        <Pressable onPress={inc} style={styles.stepBtn}>
          <Text style={styles.stepBtnLabel}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    field: {
      marginBottom: spacing.lg,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 50,
      fontSize: font.size.md,
      color: colors.text,
    },
    moneyBox: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      height: 64,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    moneyValue: {
      fontSize: font.size.xxl,
      fontWeight: font.weight.bold,
    },
    hiddenInput: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepBtn: {
      width: 50,
      height: 50,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnLabel: {
      fontSize: 24,
      color: colors.text,
      fontWeight: font.weight.medium,
    },
    stepValueBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 6,
    },
    stepValue: {
      fontSize: font.size.xl,
      fontWeight: font.weight.semibold,
      color: colors.text,
      textAlign: 'center',
      minWidth: 44,
    },
    stepSuffix: {
      fontSize: font.size.sm,
      color: colors.textSoft,
    },
  });
