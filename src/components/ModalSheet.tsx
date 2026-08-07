import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useThemedStyles } from '../store/ThemeContext';

export function ModalSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.root}>
        {/* Fundo escurecido, cobre a tela toda (inclusive sob a barra de navegação) */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Sobe o conteúdo acima do teclado nas duas plataformas */}
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.avoider}
          pointerEvents="box-none"
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
                <Text style={styles.closeLabel}>✕</Text>
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    avoider: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.bg,
      borderTopLeftRadius: radius.lg + 8,
      borderTopRightRadius: radius.lg + 8,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      maxHeight: '92%',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    title: {
      flex: 1,
      fontSize: font.size.xl,
      fontWeight: font.weight.bold,
      color: colors.text,
      paddingRight: spacing.md,
    },
    close: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeLabel: {
      fontSize: font.size.lg,
      color: colors.textSoft,
    },
    content: {
      paddingBottom: spacing.md,
    },
  });
