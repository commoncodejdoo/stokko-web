import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  setPreference(preference: ThemePreference): void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'dark',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'stokko-web-theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return preference;
}
