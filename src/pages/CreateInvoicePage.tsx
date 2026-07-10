import { useNavigate } from 'react-router-dom';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  CreateInvoiceDocument,
  InvoicesDocument,
} from '@/__generated__/graphql';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { ROUTES } from '@/core/routes/paths';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [createInvoice, { loading: submitting }] = useMutation(CreateInvoiceDocument);

  const goBack = () => navigate(ROUTES.invoices.list);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Create Invoice"
        description="Create a draft invoice. Posting to the ledger happens when you send it."
      />
      <InvoiceForm
        submitting={submitting}
        onCancel={goBack}
        onSubmit={async (input) => {
          try {
            await createInvoice({
              variables: {
                input: {
                  invoiceNumber: input.invoiceNumber,
                  vendorName: input.vendorName,
                  dueDate: new Date(`${input.dueDate}T00:00:00`).toISOString(),
                  expenseAccountId: input.expenseAccountId,
                  payableAccountId: input.payableAccountId,
                  lineItems: input.lineItems,
                },
              },
            });

            await client.refetchQueries({ include: [InvoicesDocument] });

            toast.success('Invoice created');
            navigate(ROUTES.invoices.list);
          } catch (error) {
            toast.error(getGraphQLErrorMessage(error, 'Unable to create invoice.'));
          }
        }}
      />
    </div>
  );
}
