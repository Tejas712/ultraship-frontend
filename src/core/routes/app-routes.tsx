import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { accountsRoutes } from '@/core/routes/features/accounts.routes';
import { dashboardRoutes } from '@/core/routes/features/dashboard.routes';
import { invoiceRoutes } from '@/core/routes/features/invoices.routes';
import { ledgerRoutes } from '@/core/routes/features/ledger.routes';
import { ROUTES } from '@/core/routes/paths';

const appRoutes = [
  ...dashboardRoutes,
  ...accountsRoutes,
  ...ledgerRoutes,
  ...invoiceRoutes,
];

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {appRoutes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Route>
    </Routes>
  );
}
