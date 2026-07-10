export type InvoiceLineItemDraft = {
  description: string;
  amountUsd: string;
};

export type InvoiceFormValues = {
  invoiceNumber: string;
  vendorName: string;
  dueDate: string;
  expenseAccountId: string;
  payableAccountId: string;
  lineItems: Array<{ description: string; amountMinor: string }>;
};

export type InvoiceFormInput = {
  invoiceNumber: string;
  vendorName: string;
  dueDate: string;
  expenseAccountId: string;
  payableAccountId: string;
  lineItems: InvoiceLineItemDraft[];
};
