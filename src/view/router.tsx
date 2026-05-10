import { lazy, Suspense, ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './common/components/app-shell.component';
import { RequireAuth, RedirectIfAuthenticated } from './common/components/require-auth.component';
import { Spinner } from './common/components/spinner.component';
import { LoginScreen } from './auth/login.screen';
import { ForcedPasswordChangeScreen } from './auth/forced-password-change.screen';

// Lazy-loaded route bundles — splits the initial download.
const DashboardScreen = lazy(() =>
  import('./dashboard/dashboard.screen').then((m) => ({ default: m.DashboardScreen })),
);
const WarehousesListScreen = lazy(() =>
  import('./warehouses/warehouses-list.screen').then((m) => ({
    default: m.WarehousesListScreen,
  })),
);
const WarehouseDetailScreen = lazy(() =>
  import('./warehouses/warehouse-detail.screen').then((m) => ({
    default: m.WarehouseDetailScreen,
  })),
);
const ArticlesListScreen = lazy(() =>
  import('./articles/articles-list.screen').then((m) => ({ default: m.ArticlesListScreen })),
);
const ArticleDetailScreen = lazy(() =>
  import('./articles/article-detail.screen').then((m) => ({
    default: m.ArticleDetailScreen,
  })),
);
const SuppliersListScreen = lazy(() =>
  import('./suppliers/suppliers-list.screen').then((m) => ({ default: m.SuppliersListScreen })),
);
const ProcurementsListScreen = lazy(() =>
  import('./procurements/procurements-list.screen').then((m) => ({
    default: m.ProcurementsListScreen,
  })),
);
const ProcurementDetailScreen = lazy(() =>
  import('./procurements/procurement-detail.screen').then((m) => ({
    default: m.ProcurementDetailScreen,
  })),
);
const NovaPrimkaScreen = lazy(() =>
  import('./procurements/nova-primka.screen').then((m) => ({ default: m.NovaPrimkaScreen })),
);
const CorrectionScreen = lazy(() =>
  import('./corrections/correction.screen').then((m) => ({ default: m.CorrectionScreen })),
);
const UsersListScreen = lazy(() =>
  import('./users/users-list.screen').then((m) => ({ default: m.UsersListScreen })),
);
const SettingsScreen = lazy(() =>
  import('./profile/settings.screen').then((m) => ({ default: m.SettingsScreen })),
);

const RouteFallback = () => (
  <div className="flex items-center justify-center py-20">
    <Spinner />
  </div>
);

const wrap = (node: ReactNode): ReactNode => <Suspense fallback={<RouteFallback />}>{node}</Suspense>;

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: '/login', element: <LoginScreen /> },
      { path: '/forced-password-change', element: <ForcedPasswordChangeScreen /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: wrap(<DashboardScreen />) },
          { path: '/skladista', element: wrap(<WarehousesListScreen />) },
          { path: '/skladista/:id', element: wrap(<WarehouseDetailScreen />) },
          { path: '/artikli', element: wrap(<ArticlesListScreen />) },
          { path: '/artikli/:id', element: wrap(<ArticleDetailScreen />) },
          { path: '/dobavljaci', element: wrap(<SuppliersListScreen />) },
          { path: '/primke', element: wrap(<ProcurementsListScreen />) },
          { path: '/primke/nova', element: wrap(<NovaPrimkaScreen />) },
          { path: '/primke/:id', element: wrap(<ProcurementDetailScreen />) },
          { path: '/korekcija', element: wrap(<CorrectionScreen />) },
          { path: '/korisnici', element: wrap(<UsersListScreen />) },
          { path: '/postavke', element: wrap(<SettingsScreen />) },
        ],
      },
    ],
  },
]);
