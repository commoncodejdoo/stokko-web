import { resolveTheme, useThemeStore } from '@/view/common/store/theme-store';

export function useTheme() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const resolved = resolveTheme(preference);
  return {
    preference,
    setPreference,
    resolved,
    isDark: resolved === 'dark',
    toggle: () => setPreference(resolved === 'dark' ? 'light' : 'dark'),
  };
}
