import type { LedgerEntryFieldsFragment } from '@/__generated__/graphql';
import { sumMinorStrings } from '@/lib/money';

export function getDebitTotal(entries: Pick<LedgerEntryFieldsFragment, 'entryType' | 'amountMinor'>[]): string {
  return sumMinorStrings(
    entries
      .filter((entry) => entry.entryType === 'DEBIT')
      .map((entry) => entry.amountMinor),
  );
}

export function getCreditTotal(entries: Pick<LedgerEntryFieldsFragment, 'entryType' | 'amountMinor'>[]): string {
  return sumMinorStrings(
    entries
      .filter((entry) => entry.entryType === 'CREDIT')
      .map((entry) => entry.amountMinor),
  );
}

export function isTransactionBalanced(
  entries: Pick<LedgerEntryFieldsFragment, 'entryType' | 'amountMinor'>[],
): boolean {
  return getDebitTotal(entries) === getCreditTotal(entries);
}

/** For balanced transactions, debit total equals the economic transaction amount. */
export function getTransactionAmount(entries: Pick<LedgerEntryFieldsFragment, 'entryType' | 'amountMinor'>[]): string {
  return getDebitTotal(entries);
}
