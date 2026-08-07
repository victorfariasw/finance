import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';
import { ThemeMode } from '../theme/theme';
import { ModalSheet } from './ModalSheet';

const OPTIONS: { mode: ThemeMode; label: string; icon: string; hint: string }[] = [
  { mode: 'system', label: 'Sistema', icon: '📱', hint: 'Segue o tema do celular' },
  { mode: 'light', label: 'Claro', icon: '☀️', hint: 'Sempre claro' },
  { mode: 'dark', label: 'Escuro', icon: '🌙', hint: 'Sempre escuro' },
];

export function ThemeToggle() {
  const { mode, setMode, scheme, colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Pressable style={styles.button} onPress={() => setOpen(true)} hitSlop={8}>
        <Text style={styles.buttonIcon}>{scheme === 'dark' ? '🌙' : '☀️'}</Text>
      </Pressable>

      <ModalSheet visible={open} onClose={() => setOpen(false)} title="Aparência">
        {OPTIONS.map((opt) => {
          const active = opt.mode === mode;
          return (
            <Pressable
              key={opt.mode}
              style={[styles.option, active && { borderColor: colors.accent, backgroundColor: colors.surfaceAlt }]}
              onPress={() => {
                setMode(opt.mode);
                setOpen(false);
              }}
            >
              <Text style={styles.optionIcon}>{opt.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionHint}>{opt.hint}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioOn]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </ModalSheet>
    </>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    button: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonIcon: {
      fontSize: 18,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: spacing.sm,
    },
    optionIcon: {
      fontSize: 22,
    },
    optionLabel: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.text,
    },
    optionHint: {
      fontSize: font.size.xs,
      color: colors.textFaint,
      marginTop: 2,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: colors.textFaint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOn: {
      borderColor: colors.accent,
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.accent,
    },
  });
