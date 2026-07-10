import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Plus } from 'lucide-react';
import type { InvoiceStatus } from '@/__generated__/graphql';
import { InvoicesDocument } from '@/__generated__/graphql';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES, invoiceViewPath } from '@/core/routes/paths';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { INVOICE_STATUS_FILTER_OPTIONS } from '@/constants/invoice-status';
import { InvoiceStatusFilter } from '@/enums/invoice-status-filter';

export function InvoicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState(InvoiceStatusFilter.ALL);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const { data, loading, error, refetch } = useQuery(InvoicesDocument, {
    variables: {
      pagination: { page, limit: DEFAULT_PAGE_SIZE },
      search: debouncedSearch.trim() || undefined,
      status:
        statusFilter === InvoiceStatusFilter.ALL
          ? undefined
          : (statusFilter as InvoiceStatus),
    },
    fetchPolicy: 'cache-and-network',
  });

  const pagination = data?.invoices;
  const invoices = pagination?.items ?? [];
  const totalCount = pagination?.totalCount ?? 0;

  const showEmptyState = useMemo(
    () => !loading && !error && totalCount === 0,
    [error, loading, totalCount],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage vendor invoices, posting, and payments."
        action={
          <Button render={<Link to={ROUTES.invoices.new} />}>
            <Plus className="size-4" />
            Create Invoice
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by invoice number or vendor…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value ?? InvoiceStatusFilter.ALL)
          }
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {INVOICE_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message="Unable to load invoices." onRetry={() => refetch()} />
      ) : showEmptyState ? (
        <EmptyState
          title="No invoices yet."
          description={
            debouncedSearch.trim() || statusFilter !== InvoiceStatusFilter.ALL
              ? 'No invoices match your filters.'
              : 'Create your first vendor invoice.'
          }
          action={
            debouncedSearch.trim() || statusFilter !== InvoiceStatusFilter.ALL ? undefined : (
              <Button render={<Link to={ROUTES.invoices.new} />}>
                <Plus className="size-4" />
                Create Invoice
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer"
                    onClick={() => navigate(invoiceViewPath(invoice.id))}
                  >
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {invoice.vendorName}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyDisplay minor={invoice.totalMinor} />
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyDisplay minor={invoice.remainingMinor} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={pagination?.page ?? page}
            limit={pagination?.limit ?? DEFAULT_PAGE_SIZE}
            totalCount={totalCount}
            hasNextPage={pagination?.hasNextPage ?? false}
            hasPreviousPage={pagination?.hasPreviousPage ?? false}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
