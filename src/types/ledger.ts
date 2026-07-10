import type { LedgerEntryType } from '@/__generated__/graphql';

export type DraftLedgerEntry = {
  id: string;
  accountId: string;
  entryType: LedgerEntryType | null;
  amountUsd: string;
};
