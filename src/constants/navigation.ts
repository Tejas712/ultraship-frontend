import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Truck,
} from 'lucide-react';
import { ROUTES } from '@/core/routes/paths';

export const NAV_ITEMS: Array<{
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}> = [
  { title: 'Dashboard', href: ROUTES.dashboard, icon: LayoutDashboard },
  { title: 'Accounts', href: ROUTES.accounts, icon: BookOpen },
  { title: 'Ledger', href: ROUTES.ledger, icon: FileText },
  { title: 'Invoices', href: ROUTES.invoices.list, icon: Truck },
];

export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.accounts]: 'Accounts',
  [ROUTES.ledger]: 'Ledger',
  [ROUTES.invoices.list]: 'Invoices',
};
