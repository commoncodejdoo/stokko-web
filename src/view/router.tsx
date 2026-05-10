import { lazy, Suspense, ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './common/components/app-shell.component';
import { RequireAuth, RedirectIfAuthenticated } from './common/components/require-auth.component';
import { Spinner } from './common/components/spinner.component';
import { LoginScreen } from './auth/login.screen';
import { ForcedPasswordChangeScreen } from './auth/forced-password-change.screen';
import { OnboardingScreen } from './auth/onboarding.screen';

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
const SupplierDetailScreen = lazy(() =>
  import('./suppliers/supplier-detail.screen').then((m) => ({
    default: m.SupplierDetailScreen,
  })),
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
const TransfersListScreen = lazy(() =>
  import('./transfers/transfers-list.screen').then((m) => ({
    default: m.TransfersListScreen,
  })),
);
const TransferDetailScreen = lazy(() =>
  import('./transfers/transfer-detail.screen').then((m) => ({
    default: m.TransferDetailScreen,
  })),
);
const PremjestajScreen = lazy(() =>
  import('./transfers/premjestaj.screen').then((m) => ({ default: m.PremjestajScreen })),
);
const ShiftsListScreen = lazy(() =>
  import('./sales/shifts-list.screen').then((m) => ({ default: m.ShiftsListScreen })),
);
const ShiftDetailScreen = lazy(() =>
  import('./sales/shift-detail.screen').then((m) => ({ default: m.ShiftDetailScreen })),
);
const ShiftCloseScreen = lazy(() =>
  import('./sales/shift-close.screen').then((m) => ({ default: m.ShiftCloseScreen })),
);
const AnalyticsScreen = lazy(() =>
  import('./analytics/analytics.screen').then((m) => ({ default: m.AnalyticsScreen })),
);
const UsersListScreen = lazy(() =>
  import('./users/users-list.screen').then((m) => ({ default: m.UsersListScreen })),
);
const UserDetailScreen = lazy(() =>
  import('./users/user-detail.screen').then((m) => ({ default: m.UserDetailScreen })),
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
      { path: '/onboarding', element: <OnboardingScreen /> },
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
          { path: '/dobavljaci/:id', element: wrap(<SupplierDetailScreen />) },
          { path: '/primke', element: wrap(<ProcurementsListScreen />) },
          { path: '/primke/nova', element: wrap(<NovaPrimkaScreen />) },
          { path: '/primke/:id', element: wrap(<ProcurementDetailScreen />) },
          { path: '/premjestaj', element: wrap(<TransfersListScreen />) },
          { path: '/premjestaj/novi', element: wrap(<PremjestajScreen />) },
          { path: '/premjestaj/:id', element: wrap(<TransferDetailScreen />) },
          { path: '/korekcija', element: wrap(<CorrectionScreen />) },
          { path: '/smjena', element: wrap(<ShiftsListScreen />) },
          { path: '/smjena/zatvori', element: wrap(<ShiftCloseScreen />) },
          { path: '/smjena/:id', element: wrap(<ShiftDetailScreen />) },
          { path: '/analitika', element: wrap(<AnalyticsScreen />) },
          { path: '/korisnici', element: wrap(<UsersListScreen />) },
          { path: '/korisnici/:id', element: wrap(<UserDetailScreen />) },
          { path: '/postavke', element: wrap(<SettingsScreen />) },
        ],
      },
    ],
  },
]);
