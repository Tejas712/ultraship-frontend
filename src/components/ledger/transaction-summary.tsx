import { useMemo } from 'react';
import type { LedgerEntryType } from '@/__generated__/graphql';
import { MoneyDisplay } from '@/components/shared/money-display';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  compareMinorStrings,
  formatMinorAsUsd,
  parseUsdToMinor,
  subtractMinorStrings,
  sumMinorStrings,
} from '@/lib/money';

export type DraftLedgerEntry = {
  id: string;
  accountId: string;
  entryType: LedgerEntryType | null;
  amountUsd: string;
};

export function useLedgerEntryTotals(entries: DraftLedgerEntry[]) {
  return useMemo(() => {
    const debitValues: string[] = [];
    const creditValues: string[] = [];
    let hasDebit = false;
    let hasCredit = false;

    for (const entry of entries) {
      const minor = parseUsdToMinor(entry.amountUsd);
      if (!minor) continue;
      if (entry.entryType === 'DEBIT') {
        debitValues.push(minor);
        hasDebit = true;
      }
      if (entry.entryType === 'CREDIT') {
        creditValues.push(minor);
        hasCredit = true;
      }
    }

    const debitTotal = sumMinorStrings(debitValues);
    const creditTotal = sumMinorStrings(creditValues);
    const difference = subtractMinorStrings(debitTotal, creditTotal);
    const balanced = compareMinorStrings(debitTotal, creditTotal) === 0;

    return {
      debitTotal,
      creditTotal,
      difference,
      balanced,
      hasDebit,
      hasCredit,
    };
  }, [entries]);
}

export function TransactionSummary({
  debitTotal,
  creditTotal,
  difference,
  balanced,
}: {
  debitTotal: string;
  creditTotal: string;
  difference: string;
  balanced: boolean;
}) {
  const diffAbs = difference.startsWith('-') ? difference.slice(1) : difference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transaction Summary</CardTitle>
          <Badge
            variant="outline"
            className={
              balanced
                ? 'border-emerald-500/30 text-emerald-300'
                : 'border-amber-500/30 text-amber-300'
            }
          >
            {balanced ? 'Balanced' : 'Out of balance'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Total Debits</p>
          <p className="text-lg font-semibold">
            <MoneyDisplay minor={debitTotal} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Credits</p>
          <p className="text-lg font-semibold">
            <MoneyDisplay minor={creditTotal} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Difference</p>
          <p className="text-lg font-semibold">
            {balanced
              ? formatMinorAsUsd('0')
              : `Out of balance by ${formatMinorAsUsd(diffAbs)}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function validateDraftEntries(entries: DraftLedgerEntry[]): boolean {
  if (entries.length < 2) return false;

  let hasDebit = false;
  let hasCredit = false;
  const debitValues: string[] = [];
  const creditValues: string[] = [];

  for (const entry of entries) {
    if (!entry.accountId || !entry.entryType) return false;
    const minor = parseUsdToMinor(entry.amountUsd);
    if (!minor) return false;

    if (entry.entryType === 'DEBIT') {
      hasDebit = true;
      debitValues.push(minor);
    } else {
      hasCredit = true;
      creditValues.push(minor);
    }
  }

  if (!hasDebit || !hasCredit) return false;
  return sumMinorStrings(debitValues) === sumMinorStrings(creditValues);
}
