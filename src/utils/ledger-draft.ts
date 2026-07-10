import type { DraftLedgerEntry } from '@/types/ledger';
import { parseUsdToMinor, sumMinorStrings } from '@/utils/money';

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
