import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/store/ThemeContext';
import { FinanceProvider, useFinance } from './src/store/FinanceContext';
import { currentMonthKey } from './src/utils/dates';
import { MonthKey } from './src/types';
import { Loading } from './src/components/ui';
import { TabBar, TabKey } from './src/components/TabBar';
import { ResumoScreen } from './src/screens/ResumoScreen';
import { ItemsScreen } from './src/screens/ItemsScreen';
import { CartaoScreen } from './src/screens/CartaoScreen';
import { InvestimentosScreen } from './src/screens/InvestimentosScreen';

function Root() {
  const { ready } = useFinance();
  const { colors, scheme } = useTheme();
  const [tab, setTab] = React.useState<TabKey>('resumo');
  const [month, setMonth] = React.useState<MonthKey>(currentMonthKey());

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {!ready ? (
          <Loading />
        ) : (
          <>
            {tab === 'resumo' && <ResumoScreen month={month} onChangeMonth={setMonth} />}
            {tab === 'entradas' && <ItemsScreen kind="income" month={month} onChangeMonth={setMonth} />}
            {tab === 'saidas' && <ItemsScreen kind="expense" month={month} onChangeMonth={setMonth} />}
            {tab === 'investir' && <InvestimentosScreen month={month} onChangeMonth={setMonth} />}
            {tab === 'cartao' && <CartaoScreen month={month} onChangeMonth={setMonth} />}
          </>
        )}
      </View>
      <TabBar active={tab} onChange={setTab} />
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FinanceProvider>
          <Root />
        </FinanceProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
