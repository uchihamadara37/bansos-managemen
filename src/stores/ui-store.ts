import { create } from "zustand";
import { defaultFilters, type UiFilters } from "@/lib/filters";
import type { Transaction } from "@/types";

type UiState = {
  filters: UiFilters;
  setFilters: (patch: Partial<UiFilters>) => void;
  resetFilters: () => void;

  formOpen: boolean;
  editing: Transaction | null;
  openCreate: () => void;
  openEdit: (t: Transaction) => void;
  closeForm: () => void;

  deleteTarget: Transaction | null;
  setDeleteTarget: (t: Transaction | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  filters: defaultFilters,
  // Ubah filter selain page -> otomatis kembali ke halaman 1
  setFilters: (patch) =>
    set((s) => ({
      filters: { ...s.filters, page: 1, ...patch },
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  formOpen: false,
  editing: null,
  openCreate: () => set({ formOpen: true, editing: null }),
  openEdit: (t) => set({ formOpen: true, editing: t }),
  closeForm: () => set({ formOpen: false, editing: null }),

  deleteTarget: null,
  setDeleteTarget: (t) => set({ deleteTarget: t }),
}));