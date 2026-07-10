import { useMemo } from 'react';
import type { DraftLedgerEntry } from '@/types/ledger';
import {
  compareMinorStrings,
  parseUsdToMinor,
  subtractMinorStrings,
  sumMinorStrings,
} from '@/utils/money';

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
