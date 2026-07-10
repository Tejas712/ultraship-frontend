import type { AccountType } from '@/__generated__/graphql';
import { Badge } from '@/components/ui/badge';
import {
  ACCOUNT_TYPE_BADGE_VARIANTS,
  ACCOUNT_TYPE_LABELS,
} from '@/constants/account-type';
import { cn } from '@/lib/utils';

export function AccountTypeBadge({ type }: { type: AccountType }) {
  return (
    <Badge variant="outline" className={cn('font-normal', ACCOUNT_TYPE_BADGE_VARIANTS[type])}>
      {ACCOUNT_TYPE_LABELS[type]}
    </Badge>
  );
}
