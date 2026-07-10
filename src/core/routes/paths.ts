export const ROUTES = {
  dashboard: '/',
  accounts: '/accounts',
  ledger: '/ledger',
  invoices: {
    list: '/invoices',
    new: '/invoices/new',
    view: '/invoices/:id',
    edit: '/invoices/:id/edit',
  },
} as const;

export function invoiceViewPath(id: string): string {
  return `/invoices/${id}`;
}

export function invoiceEditPath(id: string): string {
  return `/invoices/${id}/edit`;
}
