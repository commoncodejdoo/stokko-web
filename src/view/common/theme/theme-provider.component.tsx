import { ReactNode, useEffect } from 'react';
import { resolveTheme, useThemeStore } from '@/view/common/store/theme-store';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(preference);
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      root.style.colorScheme = resolved;
    };
    apply();

    if (preference === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
  }, [preference]);

  return <>{children}</>;
}
