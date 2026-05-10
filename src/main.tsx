import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/view/common/theme/theme-provider.component';
import { ToastViewport } from '@/view/common/components/toast.component';
import { setupAnalytics } from '@/view/common/analytics';
import { setupObservability } from '@/view/common/observability';
import { bootImpersonationFromHash } from '@/view/auth/impersonation-boot.hook';
import './index.css';
import { router } from './view/router';

setupAnalytics();
setupObservability();
bootImpersonationFromHash();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastViewport>
          <RouterProvider router={router} />
        </ToastViewport>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
