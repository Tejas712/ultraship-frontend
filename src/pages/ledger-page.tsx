import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Plus } from 'lucide-react';
import { LedgerTransactionsDocument } from '@/__generated__/graphql';
import { RecordTransactionDialog } from '@/components/ledger/record-transaction-dialog';
import { TransactionDetailDialog } from '@/components/ledger/transaction-detail-dialog';
import { MoneyDisplay } from '@/components/shared/money-display';
import { PaginationControls } from '@/components/shared/pagination-controls';
import {
  EmptyState,
  ErrorState,
  PageHeader,
} from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { getTransactionAmount } from '@/lib/ledger';

const PAGE_SIZE = 20;

export function LedgerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, loading, error, refetch } = useQuery(LedgerTransactionsDocument, {
    variables: {
      pagination: { page, limit: PAGE_SIZE },
      reference: debouncedSearch.trim() || undefined,
    },
  });

  useEffect(() => {
    const transactionId = (
      location.state as { transactionId?: string } | null
    )?.transactionId;
    if (!transactionId) return;

    setSelectedTransactionId(transactionId);
    setDetailDialogOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const openTransactionDetail = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setDetailDialogOpen(true);
  };

  const pagination = data?.ledgerTransactions;
  const transactions = pagination?.items ?? [];
  const totalCount = pagination?.totalCount ?? 0;
  const hasNextPage = pagination?.hasNextPage ?? false;
  const hasPreviousPage = pagination?.hasPreviousPage ?? false;
  const currentPage = pagination?.page ?? page;

  const showEmptyState = useMemo(
    () => !loading && !error && totalCount === 0,
    [error, loading, totalCount],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ledger"
        description="Review balanced double-entry transactions."
        action={
          <Button onClick={() => setRecordDialogOpen(true)}>
            <Plus className="size-4" />
            Record Transaction
          </Button>
        }
      />

      <Input
        placeholder="Search by reference…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-xs"
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message="Unable to load ledger transactions."
          onRetry={() => refetch()}
        />
      ) : showEmptyState ? (
        <EmptyState
          title="No transactions yet."
          description={
            debouncedSearch.trim()
              ? 'No transactions match your search.'
              : 'Record your first balanced ledger transaction.'
          }
          action={
            debouncedSearch.trim() ? undefined : (
              <Button onClick={() => setRecordDialogOpen(true)}>
                <Plus className="size-4" />
                Record Transaction
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
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Entry date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const amount = getTransactionAmount(transaction.entries);

                  return (
                    <TableRow
                      key={transaction.id}
                      className="cursor-pointer"
                      onClick={() => openTransactionDetail(transaction.id)}
                    >
                      <TableCell className="font-medium">
                        {transaction.reference}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {transaction.description ?? '—'}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay minor={amount} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={currentPage}
            limit={pagination?.limit ?? PAGE_SIZE}
            totalCount={totalCount}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      )}

      <RecordTransactionDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        onSuccess={async () => {
          setPage(1);
          await refetch({
            pagination: { page: 1, limit: PAGE_SIZE },
            reference: debouncedSearch.trim() || undefined,
          });
        }}
      />
      <TransactionDetailDialog
        transactionId={selectedTransactionId}
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) setSelectedTransactionId(null);
        }}
      />
    </div>
  );
}
