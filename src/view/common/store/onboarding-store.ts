import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OnboardingState {
  seen: boolean;
  markSeen(): void;
  reset(): void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      seen: false,
      markSeen: () => set({ seen: true }),
      reset: () => set({ seen: false }),
    }),
    {
      name: 'stokko-web-onboarding',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
