import type { InvoiceStatus } from '@/__generated__/graphql';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
};

export const INVOICE_STATUS_BADGE_VARIANTS: Record<InvoiceStatus, string> = {
  DRAFT: 'text-muted-foreground',
  SENT: 'border-blue-500/30 text-blue-300',
  PAID: 'border-emerald-500/30 text-emerald-300',
  OVERDUE: 'border-destructive/30 text-destructive',
};

export const INVOICE_STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
];
