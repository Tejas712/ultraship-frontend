import { AccountsPage } from '@/pages/AccountsPage';
import { ROUTES } from '@/core/routes/paths';
import type { AppRoute } from '@/core/routes/types';

export const accountsRoutes: AppRoute[] = [
  { path: ROUTES.accounts, Component: AccountsPage },
];
