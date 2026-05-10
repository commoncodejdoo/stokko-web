import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './common/components/app-shell.component';
import { RequireAuth, RedirectIfAuthenticated } from './common/components/require-auth.component';
import { LoginScreen } from './auth/login.screen';
import { ForcedPasswordChangeScreen } from './auth/forced-password-change.screen';
import { DashboardScreen } from './dashboard/dashboard.screen';
import { WarehousesListScreen } from './warehouses/warehouses-list.screen';
import { WarehouseDetailScreen } from './warehouses/warehouse-detail.screen';
import { ArticlesListScreen } from './articles/articles-list.screen';
import { ArticleDetailScreen } from './articles/article-detail.screen';
import { SuppliersListScreen } from './suppliers/suppliers-list.screen';
import { ProcurementsListScreen } from './procurements/procurements-list.screen';
import { ProcurementDetailScreen } from './procurements/procurement-detail.screen';
import { NovaPrimkaScreen } from './procurements/nova-primka.screen';
import { CorrectionScreen } from './corrections/correction.screen';
import { UsersListScreen } from './users/users-list.screen';
import { SettingsScreen } from './profile/settings.screen';

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
          { path: '/', element: <DashboardScreen /> },
          { path: '/skladista', element: <WarehousesListScreen /> },
          { path: '/skladista/:id', element: <WarehouseDetailScreen /> },
          { path: '/artikli', element: <ArticlesListScreen /> },
          { path: '/artikli/:id', element: <ArticleDetailScreen /> },
          { path: '/dobavljaci', element: <SuppliersListScreen /> },
          { path: '/primke', element: <ProcurementsListScreen /> },
          { path: '/primke/nova', element: <NovaPrimkaScreen /> },
          { path: '/primke/:id', element: <ProcurementDetailScreen /> },
          { path: '/korekcija', element: <CorrectionScreen /> },
          { path: '/korisnici', element: <UsersListScreen /> },
          { path: '/postavke', element: <SettingsScreen /> },
        ],
      },
    ],
  },
]);
