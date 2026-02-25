import { create } from 'zustand';

type Toast = { id: string; text: string; tone?: 'info' | 'error' | 'success' };

type UiState = {
  toasts: Toast[];
  pushToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (toast) => set((state) => ({ toasts: [...state.toasts.slice(-3), toast] })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
