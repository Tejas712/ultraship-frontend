import { formatMinorAsUsd } from '@/lib/money';
import { cn } from '@/lib/utils';

export function MoneyDisplay({
  minor,
  className,
}: {
  minor: string;
  className?: string;
}) {
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {formatMinorAsUsd(minor)}
    </span>
  );
}
