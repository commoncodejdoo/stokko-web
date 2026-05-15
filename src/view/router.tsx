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
const NewProcurementScreen = lazy(() =>
  import('./procurements/new-procurement.screen').then((m) => ({
    default: m.NewProcurementScreen,
  })),
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
const TransferScreen = lazy(() =>
  import('./transfers/transfer.screen').then((m) => ({ default: m.TransferScreen })),
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
const RecommendationsScreen = lazy(() =>
  import('./predictions/recommendations.screen').then((m) => ({
    default: m.RecommendationsScreen,
  })),
);
const RecommendationDetailScreen = lazy(() =>
  import('./predictions/recommendation-detail.screen').then((m) => ({
    default: m.RecommendationDetailScreen,
  })),
);
const ShoppingModeScreen = lazy(() =>
  import('./predictions/shopping-mode.screen').then((m) => ({
    default: m.ShoppingModeScreen,
  })),
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
          { path: '/warehouses', element: wrap(<WarehousesListScreen />) },
          { path: '/warehouses/:id', element: wrap(<WarehouseDetailScreen />) },
          { path: '/articles', element: wrap(<ArticlesListScreen />) },
          { path: '/articles/:id', element: wrap(<ArticleDetailScreen />) },
          { path: '/suppliers', element: wrap(<SuppliersListScreen />) },
          { path: '/suppliers/:id', element: wrap(<SupplierDetailScreen />) },
          { path: '/procurements', element: wrap(<ProcurementsListScreen />) },
          { path: '/procurements/new', element: wrap(<NewProcurementScreen />) },
          { path: '/procurements/:id', element: wrap(<ProcurementDetailScreen />) },
          { path: '/transfers', element: wrap(<TransfersListScreen />) },
          { path: '/transfers/new', element: wrap(<TransferScreen />) },
          { path: '/transfers/:id', element: wrap(<TransferDetailScreen />) },
          { path: '/corrections', element: wrap(<CorrectionScreen />) },
          { path: '/shifts', element: wrap(<ShiftsListScreen />) },
          { path: '/shifts/close', element: wrap(<ShiftCloseScreen />) },
          { path: '/shifts/:id', element: wrap(<ShiftDetailScreen />) },
          { path: '/analytics', element: wrap(<AnalyticsScreen />) },
          { path: '/recommendations', element: wrap(<RecommendationsScreen />) },
          {
            path: '/recommendations/:articleId/:warehouseId',
            element: wrap(<RecommendationDetailScreen />),
          },
          { path: '/shopping-mode/:id', element: wrap(<ShoppingModeScreen />) },
          { path: '/users', element: wrap(<UsersListScreen />) },
          { path: '/users/:id', element: wrap(<UserDetailScreen />) },
          { path: '/settings', element: wrap(<SettingsScreen />) },
        ],
      },
    ],
  },
]);
