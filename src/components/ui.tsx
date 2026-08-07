import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { Palette, spacing, radius, font, shadow } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function Divider() {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.divider} />;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bg =
    variant === 'primary' ? colors.accent : variant === 'danger' ? colors.expenseSoft : 'transparent';
  const fg =
    variant === 'primary' ? colors.onAccent : variant === 'danger' ? colors.expense : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        variant === 'ghost' && styles.buttonGhost,
        style,
      ]}
    >
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  color?: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const activeColor = color ?? colors.accent;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active ? { backgroundColor: activeColor, borderColor: activeColor } : null,
      ]}
    >
      <Text style={[styles.chipLabel, active ? { color: colors.onFill } : null]}>{label}</Text>
    </Pressable>
  );
}

export function Fab({ onPress, label = '+' }: { onPress: () => void; label?: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed ? { opacity: 0.85, transform: [{ scale: 0.97 }] } : null]}
    >
      <Text style={styles.fabLabel}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.empty}>
      {icon ? <Text style={styles.emptyIcon}>{icon}</Text> : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Loading() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.textSoft} />
    </View>
  );
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadow.card,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: font.size.sm,
      fontWeight: font.weight.semibold,
      color: colors.textSoft,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.sm,
    },
    button: {
      height: 50,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    buttonGhost: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonLabel: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipLabel: {
      fontSize: font.size.sm,
      fontWeight: font.weight.medium,
      color: colors.text,
    },
    fab: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
      shadowOpacity: 0.18,
      elevation: 4,
    },
    fabLabel: {
      color: colors.onAccent,
      fontSize: 28,
      lineHeight: 32,
      fontWeight: font.weight.regular,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
      fontSize: 34,
      marginBottom: spacing.sm,
    },
    emptyTitle: {
      fontSize: font.size.md,
      fontWeight: font.weight.semibold,
      color: colors.text,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: font.size.sm,
      color: colors.textFaint,
      textAlign: 'center',
      marginTop: spacing.xs,
      lineHeight: 20,
    },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: font.size.sm,
      fontWeight: font.weight.medium,
      color: colors.textSoft,
      marginBottom: spacing.xs,
    },
  });
