import { create } from 'zustand';

type TransientUiState = {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  pendingShareText: string | null;
  setPendingShareText: (text: string | null) => void;
  pendingLaunchFile: File | null;
  setPendingLaunchFile: (file: File | null) => void;
  /** Erzwungenes Onboarding (z. B. aus Hilfe) — unabhängig von localStorage. */
  onboardingOpen: boolean;
  /** Erhöht sich bei jedem Öffnen — remountet Onboarding für frischen Tour-Start. */
  onboardingSession: number;
  openOnboarding: () => void;
  closeOnboarding: () => void;
};

export const useTransientUiStore = create<TransientUiState>((set, get) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set({ commandPaletteOpen: !get().commandPaletteOpen }),
  pendingShareText: null,
  setPendingShareText: (text) => set({ pendingShareText: text }),
  pendingLaunchFile: null,
  setPendingLaunchFile: (file) => set({ pendingLaunchFile: file }),
  onboardingOpen: false,
  onboardingSession: 0,
  openOnboarding: () =>
    set({
      onboardingOpen: true,
      onboardingSession: get().onboardingSession + 1,
    }),
  closeOnboarding: () => set({ onboardingOpen: false }),
}));
