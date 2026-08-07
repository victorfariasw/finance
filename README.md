# Finanças — controle financeiro pessoal

App pessoal (Expo / React Native + TypeScript) para controle de entradas, saídas e cartão de crédito.
**Armazenamento 100% local** no dispositivo (AsyncStorage). Sem backend, sem conta, sem login.

## Como rodar

```bash
cd financas
npm start
```

Depois:
- **Celular:** instale o app **Expo Go** (Android/iOS) e escaneie o QR Code do terminal.
- **Emulador Android:** `npm run android`
- **Simulador iOS (Mac):** `npm run ios`

## Conceitos

- **Entradas / Saídas:** itens com um valor **previsto**. Podem ser **fixos** (repetem todo mês)
  ou **avulsos** (só num mês). A cada mês você lança o valor **realizado** (o que de fato entrou/saiu).
- **Cartão de crédito:** fica numa aba separada. Você registra a compra com **valor total** +
  **nº de parcelas**; cada parcela cai fechada no seu mês. No Resumo aparece como **uma única linha**,
  sem se misturar com as saídas comuns (boleto/Pix).
- **Investir:** o **aporte** do mês sai do caixa (reduz o saldo disponível), mas soma no
  **patrimônio investido (montante)**. O **rendimento** não sai do bolso, só soma no montante.
  O patrimônio é acumulado ao longo dos meses e representa "quanto tenho disponível se precisar".
- **Resumo:** saldo previsto × realizado do mês (já descontando o aporte), linhas separadas de
  cartão e investimento, gráfico comparativo e projeção de 6 meses.

Valores monetários são guardados em **centavos (inteiro)** para evitar erros de arredondamento.

## Estrutura

```
App.tsx                 Casca: providers + abas + mês compartilhado
src/
  theme/theme.ts        Cores, espaçamentos, tipografia
  types/index.ts        Modelos de dados
  utils/                money (centavos), dates (mês), id
  store/
    storage.ts          Load/save AsyncStorage
    selectors.ts        Regras de negócio por mês (puras)
    FinanceContext.tsx  Estado global + persistência automática
  components/           UI reutilizável, inputs, modais, gráficos
  screens/              Resumo, Entradas/Saídas (ItemsScreen), Investimentos, Cartão
```
