import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  AccountsDocument,
  LedgerTransactionsDocument,
} from '@/__generated__/graphql';
import { MoneyDisplay } from '@/components/shared/money-display';
import { ErrorState } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getTransactionAmount } from '@/lib/ledger';
import { sumMinorStrings } from '@/lib/money';

function SummaryCard({
  title,
  value,
  loading,
  format = 'money',
}: {
  title: string;
  value: string;
  loading: boolean;
  format?: 'money' | 'count';
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : format === 'count' ? (
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        ) : (
          <div className="text-2xl font-semibold tracking-tight">
            <MoneyDisplay minor={value} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const accountsQuery = useQuery(AccountsDocument);
  const ledgerQuery = useQuery(LedgerTransactionsDocument, {
    variables: {
      pagination: { limit: 5 },
    },
  });

  const loading = accountsQuery.loading || ledgerQuery.loading;
  const accounts = accountsQuery.data?.accounts ?? [];
  const ledgerPage = ledgerQuery.data?.ledgerTransactions;
  const recentTransactions = ledgerPage?.items ?? [];

  const totalAssets = sumMinorStrings(
    accounts
      .filter((account) => account.type === 'ASSET')
      .map((account) => account.balanceMinor),
  );

  const totalLiabilities = sumMinorStrings(
    accounts
      .filter((account) => account.type === 'LIABILITY')
      .map((account) => account.balanceMinor),
  );

  if (accountsQuery.error || ledgerQuery.error) {
    return (
      <ErrorState
        message="Unable to load dashboard data."
        onRetry={() => {
          void accountsQuery.refetch();
          void ledgerQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Finance operations overview for accounts and ledger activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Accounts"
          value={accounts.length.toString()}
          loading={loading}
          format="count"
        />
        <SummaryCard
          title="Total Assets"
          value={totalAssets}
          loading={loading}
        />
        <SummaryCard
          title="Total Liabilities"
          value={totalLiabilities}
          loading={loading}
        />
        <SummaryCard
          title="Recent Ledger Transactions"
          value={(ledgerPage?.totalCount ?? 0).toString()}
          loading={loading}
          format="count"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No transactions recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                  {recentTransactions.map((transaction) => {
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <button
                            type="button"
                            className="font-medium text-primary hover:underline"
                            onClick={() =>
                              navigate('/ledger', {
                                state: { transactionId: transaction.id },
                              })
                            }
                          >
                            {transaction.reference}
                          </button>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {transaction.description ?? '—'}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            transaction.transactionDate,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <MoneyDisplay
                            minor={getTransactionAmount(transaction.entries)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
