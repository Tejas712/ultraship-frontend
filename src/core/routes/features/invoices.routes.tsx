import { CreateInvoicePage } from '@/pages/CreateInvoicePage';
import { EditInvoicePage } from '@/pages/EditInvoicePage';
import { InvoiceViewPage } from '@/pages/InvoiceViewPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { ROUTES } from '@/core/routes/paths';
import type { AppRoute } from '@/core/routes/types';

export const invoiceRoutes: AppRoute[] = [
  { path: ROUTES.invoices.list, Component: InvoicesPage },
  { path: ROUTES.invoices.new, Component: CreateInvoicePage },
  { path: ROUTES.invoices.edit, Component: EditInvoicePage },
  { path: ROUTES.invoices.view, Component: InvoiceViewPage },
];
