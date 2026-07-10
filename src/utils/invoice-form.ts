import type { InvoiceFieldsFragment } from '@/__generated__/graphql';
import {
  EMPTY_INVOICE_LINE_ITEM,
} from '@/constants/invoice-form';
import type { InvoiceFormInput } from '@/types/invoice-form';
import { formatMinorAsUsdPlain } from '@/utils/money';

export function invoiceToFormDefaults(
  invoice: InvoiceFieldsFragment,
): InvoiceFormInput {
  return {
    invoiceNumber: invoice.invoiceNumber,
    vendorName: invoice.vendorName,
    dueDate: new Date(invoice.dueDate).toLocaleDateString('en-CA'),
    expenseAccountId: invoice.expenseAccount.id,
    payableAccountId: invoice.payableAccount.id,
    lineItems:
      invoice.lineItems.length > 0
        ? invoice.lineItems.map((item) => ({
            description: item.description,
            amountUsd: formatMinorAsUsdPlain(item.amountMinor),
          }))
        : [EMPTY_INVOICE_LINE_ITEM],
  };
}
