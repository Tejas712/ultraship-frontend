import type { AccountType } from '@/__generated__/graphql';
import { ACCOUNT_TYPE_LABELS } from '@/constants/account-type';

export function accountTypeLabel(type: AccountType): string {
  return ACCOUNT_TYPE_LABELS[type];
}
