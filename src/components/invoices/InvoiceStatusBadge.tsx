import type { InvoiceStatus } from '@/__generated__/graphql';
import { Badge } from '@/components/ui/badge';
import { INVOICE_STATUS_BADGE_VARIANTS, INVOICE_STATUS_LABELS } from '@/constants/invoice-status';
import { cn } from '@/lib/utils';

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant="outline" className={cn('font-normal', INVOICE_STATUS_BADGE_VARIANTS[status])}>
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );
}
