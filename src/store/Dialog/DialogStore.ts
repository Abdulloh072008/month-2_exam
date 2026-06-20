import { create } from 'zustand';

type DebtType = 'i-owe' | 'owes-me';

interface DialogState {
  addDebtOpen: boolean;
  addDebtType: DebtType;
  openAddDebt: (type: DebtType) => void;
  closeAddDebt: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  addDebtOpen: false,
  addDebtType: 'owes-me',
  openAddDebt: (type) => set({ addDebtOpen: true, addDebtType: type }),
  closeAddDebt: () => set({ addDebtOpen: false }),
}));