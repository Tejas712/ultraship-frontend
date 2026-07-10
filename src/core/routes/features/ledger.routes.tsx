import { LedgerPage } from '@/pages/LedgerPage';
import { ROUTES } from '@/core/routes/paths';
import type { AppRoute } from '@/core/routes/types';

export const ledgerRoutes: AppRoute[] = [
  { path: ROUTES.ledger, Component: LedgerPage },
];
