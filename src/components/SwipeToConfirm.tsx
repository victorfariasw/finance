import React from 'react';
import { Animated, PanResponder, View, Text, StyleSheet } from 'react-native';
import { Palette, spacing, radius, font } from '../theme/theme';
import { useTheme, useThemedStyles } from '../store/ThemeContext';

const MAX_REVEAL = -104; // quanto a linha desliza
const THRESHOLD = -72; // a partir daqui, confirma ao soltar

/**
 * Envolve uma linha e permite arrastá-la para a ESQUERDA para confirmar uma ação
 * (ex: lançar o valor previsto). Usa PanResponder para não brigar com o scroll
 * vertical: só assume o gesto quando o movimento é predominantemente horizontal.
 */
export function SwipeToConfirm({
  enabled,
  label,
  color,
  onConfirm,
  children,
}: {
  enabled: boolean;
  label: string;
  color: string;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const translateX = React.useRef(new Animated.Value(0)).current;

  // Refs para o PanResponder (criado uma vez) enxergar valores atuais.
  const enabledRef = React.useRef(enabled);
  enabledRef.current = enabled;
  const onConfirmRef = React.useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  // Sempre que a linha alterna entre arrastável/não-arrastável (ex: confirmou e
  // depois voltou pra previsto), zera o deslocamento para não "remontar" aberta.
  React.useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);
  }, [enabled, translateX]);

  const responder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        enabledRef.current && g.dx < -6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_e, g) => {
        const x = Math.max(MAX_REVEAL, Math.min(0, g.dx));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dx <= THRESHOLD) {
          Animated.timing(translateX, { toValue: 0, duration: 150, useNativeDriver: true }).start();
          onConfirmRef.current();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
      },
    }),
  ).current;

  if (!enabled) {
    // Sem gesto: renderiza o conteúdo direto (garante translate zerado).
    return <View>{children}</View>;
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.action, { backgroundColor: color }]}>
        <Text style={[styles.actionText, { color: colors.onFill }]} numberOfLines={1}>
          ✓ {label}
        </Text>
      </View>
      <Animated.View
        style={[styles.foreground, { backgroundColor: colors.surface, transform: [{ translateX }] }]}
        {...responder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: {
      position: 'relative',
      borderRadius: radius.sm,
      overflow: 'hidden',
    },
    action: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingRight: spacing.lg,
    },
    actionText: {
      fontSize: font.size.sm,
      fontWeight: font.weight.bold,
    },
    foreground: {
      // fundo opaco para cobrir a ação quando em repouso
    },
  });
