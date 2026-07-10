import type { LedgerEntryFieldsFragment } from '@/__generated__/graphql';
import { sumMinorStrings } from '@/utils/money';

export function getDebitTotal(
  entries: Pick<LedgerEntryFieldsFragment, 'entryType' | 'amountMinor'>[],
): string {
  return sumMinorStrings(
    entries
      .filter((entry) => entry.entryType === 'DEBIT')
      .map((entry) => entry.amountMinor),
  );
}

export function getCreditTotal(
  entries: Pick<LedgerEntryFieldsFragment, 'entryType' | 'amountMinor'>[],
): string {
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
export function getTransactionAmount(
  entries: Pick<LedgerEntryFieldsFragment, 'entryType' | 'amountMinor'>[],
): string {
  return getDebitTotal(entries);
}

export function getTransactionAccounts(
  entries: Pick<LedgerEntryFieldsFragment, 'entryType' | 'account'>[],
): { debit: string; credit: string } {
  return {
    debit: entries.find((entry) => entry.entryType === 'DEBIT')?.account.name ?? '—',
    credit: entries.find((entry) => entry.entryType === 'CREDIT')?.account.name ?? '—',
  };
}
