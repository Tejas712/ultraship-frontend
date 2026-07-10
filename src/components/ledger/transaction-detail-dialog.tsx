import { useQuery } from '@apollo/client/react';
import { LedgerTransactionDocument } from '@/__generated__/graphql';
import { AccountTypeBadge } from '@/components/shared/account-type-badge';
import { MoneyDisplay } from '@/components/shared/money-display';
import { ErrorState } from '@/components/shared/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export function TransactionDetailDialog({
  transactionId,
  open,
  onOpenChange,
}: {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, loading, error, refetch } = useQuery(LedgerTransactionDocument, {
    variables: { id: transactionId ?? '' },
    skip: !open || !transactionId,
  });

  const transaction = data?.ledgerTransaction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error || !transaction ? (
          <ErrorState
            message="Unable to load ledger transaction."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{transaction.reference}</DialogTitle>
              {transaction.description ? (
                <DialogDescription>{transaction.description}</DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  Ledger entry details
                </DialogDescription>
              )}
            </DialogHeader>

            <div>
              <p className="text-xs text-muted-foreground">Entry date</p>
              <p className="text-sm font-medium">
                {new Date(transaction.transactionDate).toLocaleString()}
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.account.name}
                      </TableCell>
                      <TableCell>
                        <AccountTypeBadge type={entry.account.type} />
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay
                          minor={entry.amountMinor}
                          className={cn(
                            entry.entryType === 'DEBIT'
                              ? 'text-red-400'
                              : 'text-emerald-400',
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
