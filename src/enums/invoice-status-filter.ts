import type { InvoiceStatus } from '@/__generated__/graphql';

export const InvoiceStatusFilter = {
  ALL: 'ALL',
} as const;

export type InvoiceStatusFilterValue =
  | typeof InvoiceStatusFilter.ALL
  | InvoiceStatus;
