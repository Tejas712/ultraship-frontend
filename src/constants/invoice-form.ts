import type { InvoiceFormInput } from '@/types/invoice-form';

export const EMPTY_INVOICE_LINE_ITEM = { description: '', amountUsd: '' };

export const DEFAULT_INVOICE_FORM_VALUES: InvoiceFormInput = {
  invoiceNumber: '',
  vendorName: '',
  dueDate: '',
  expenseAccountId: '',
  payableAccountId: '',
  lineItems: [EMPTY_INVOICE_LINE_ITEM],
};
