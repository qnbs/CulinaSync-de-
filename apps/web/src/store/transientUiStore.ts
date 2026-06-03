import { create } from 'zustand';

type TransientUiState = {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  pendingShareText: string | null;
  setPendingShareText: (text: string | null) => void;
  pendingLaunchFile: File | null;
  setPendingLaunchFile: (file: File | null) => void;
};

export const useTransientUiStore = create<TransientUiState>((set, get) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set({ commandPaletteOpen: !get().commandPaletteOpen }),
  pendingShareText: null,
  setPendingShareText: (text) => set({ pendingShareText: text }),
  pendingLaunchFile: null,
  setPendingLaunchFile: (file) => set({ pendingLaunchFile: file }),
}));
