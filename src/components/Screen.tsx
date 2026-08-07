import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette, spacing, font } from '../theme/theme';
import { useThemedStyles } from '../store/ThemeContext';

/** Casca de tela: cabeçalho com título + subtítulo opcional. */
export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    title: {
      fontSize: font.size.xxl,
      fontWeight: font.weight.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: font.size.sm,
      color: colors.textSoft,
      marginTop: 2,
    },
  });
