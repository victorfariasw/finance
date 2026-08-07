import React from 'react';
import { Alert } from 'react-native';
import { ModalSheet } from './ModalSheet';
import { MoneyInput, TextField } from './inputs';
import { Button } from './ui';
import { spacing } from '../theme/theme';
import { useTheme } from '../store/ThemeContext';
import { MonthKey, YieldEntry } from '../types';
import { useFinance } from '../store/FinanceContext';
import { labelLong } from '../utils/dates';

export function YieldModal({
  visible,
  onClose,
  month,
  editing,
}: {
  visible: boolean;
  onClose: () => void;
  month: MonthKey;
  editing?: YieldEntry | null;
}) {
  const { addYield, updateYield, deleteYield } = useFinance();
  const { colors } = useTheme();

  const [amount, setAmount] = React.useState(0);
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (!visible) return;
    if (editing) {
      setAmount(editing.amount);
      setDescription(editing.description);
    } else {
      setAmount(0);
      setDescription('');
    }
  }, [visible, editing]);

  const canSave = amount > 0;

  const save = () => {
    if (!canSave) return;
    if (editing) {
      updateYield({ ...editing, amount, description: description.trim() });
    } else {
      addYield({ month, amount, description: description.trim() });
    }
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    Alert.alert('Excluir', 'Excluir este rendimento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteYield(editing.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={editing ? 'Editar rendimento' : `Rendimento · ${labelLong(month)}`}
    >
      <MoneyInput label="Valor do rendimento" cents={amount} onChange={setAmount} accent={colors.invest} />
      <TextField
        label="Descrição (opcional)"
        value={description}
        onChange={setDescription}
        placeholder="Ex: CDB, dividendos..."
      />
      <Button label="Salvar" onPress={save} disabled={!canSave} />
      {editing ? (
        <Button label="Excluir" onPress={remove} variant="danger" style={{ marginTop: spacing.sm }} />
      ) : null}
    </ModalSheet>
  );
}
