import { DashboardPage } from '@/pages/DashboardPage';
import { ROUTES } from '@/core/routes/paths';
import type { AppRoute } from '@/core/routes/types';

export const dashboardRoutes: AppRoute[] = [
  { path: ROUTES.dashboard, Component: DashboardPage },
];
