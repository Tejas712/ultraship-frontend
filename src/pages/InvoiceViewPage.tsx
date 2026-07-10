import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { ArrowLeft } from 'lucide-react';
import { InvoiceDocument } from '@/__generated__/graphql';
import { InvoiceDetail } from '@/components/invoices/InvoiceDetail';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/core/routes/paths';

export function InvoiceViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useQuery(InvoiceDocument, {
    variables: { id: id ?? '' },
    skip: !id,
  });

  const invoice = data?.invoice;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link to={ROUTES.invoices.list} />}
      >
        <ArrowLeft className="size-4" />
        All invoices
      </Button>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full max-w-xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error || !invoice ? (
        <ErrorState message="Unable to load invoice." onRetry={() => refetch()} />
      ) : (
        <InvoiceDetail invoice={invoice} onUpdated={async () => { await refetch(); }} />
      )}
    </div>
  );
}
