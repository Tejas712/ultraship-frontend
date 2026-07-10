import type { AccountType, LedgerEntryType } from '@/__generated__/graphql';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LABELS: Record<AccountType, string> = {
  ASSET: 'Asset',
  LIABILITY: 'Liability',
  EQUITY: 'Equity',
  REVENUE: 'Revenue',
  EXPENSE: 'Expense',
};

const VARIANTS: Record<AccountType, string> = {
  ASSET: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  LIABILITY: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  EQUITY: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  REVENUE: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  EXPENSE: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

export function AccountTypeBadge({ type }: { type: AccountType }) {
  return (
    <Badge variant="outline" className={cn('font-normal', VARIANTS[type])}>
      {LABELS[type]}
    </Badge>
  );
}

export function accountTypeLabel(type: AccountType): string {
  return LABELS[type];
}

export const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REVENUE', label: 'Revenue' },
  { value: 'EXPENSE', label: 'Expense' },
];

export const ENTRY_TYPE_OPTIONS: { value: LedgerEntryType; label: string }[] = [
  { value: 'DEBIT', label: 'Debit' },
  { value: 'CREDIT', label: 'Credit' },
];
