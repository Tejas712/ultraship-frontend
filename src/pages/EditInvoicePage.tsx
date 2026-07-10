import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  InvoiceDocument,
  InvoicesDocument,
  UpdateInvoiceDocument,
} from '@/__generated__/graphql';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { invoiceViewPath } from '@/core/routes/paths';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';

export function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(InvoiceDocument, {
    variables: { id: id ?? '' },
    skip: !id,
  });
  const [updateInvoice, { loading: submitting }] = useMutation(UpdateInvoiceDocument);

  const invoice = data?.invoice;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <ErrorState message="Unable to load invoice." onRetry={() => refetch()} />
      </div>
    );
  }

  if (invoice.status !== 'DRAFT') {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          render={<Link to={invoiceViewPath(invoice.id)} />}
        >
          <ArrowLeft className="size-4" />
          Back to invoice
        </Button>
        <ErrorState message="Only draft invoices can be edited." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link to={invoiceViewPath(invoice.id)} />}
      >
        <ArrowLeft className="size-4" />
        Back to invoice
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Invoice</h1>
        <p className="text-sm text-muted-foreground">
          Update {invoice.invoiceNumber} before sending it.
        </p>
      </div>

      <InvoiceForm
        key={invoice.id}
        initialInvoice={invoice}
        submitting={submitting}
        submitLabel="Save Changes"
        onCancel={() => navigate(invoiceViewPath(invoice.id))}
        onSubmit={async (input) => {
          try {
            await updateInvoice({
              variables: {
                id: invoice.id,
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
            toast.success('Invoice updated');
            navigate(invoiceViewPath(invoice.id));
          } catch (updateError) {
            toast.error(
              getGraphQLErrorMessage(updateError, 'Unable to update invoice.'),
            );
          }
        }}
      />
    </div>
  );
}
