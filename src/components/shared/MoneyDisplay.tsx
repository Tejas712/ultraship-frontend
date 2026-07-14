import { formatMinorAsUsd } from '@/utils/money';
import { cn } from '@/lib/utils';

function isNegativeMinor(minor: string): boolean {
  return /^-?[1-9]\d*$/.test(minor) && minor.startsWith('-');
}

function isPositiveMinor(minor: string): boolean {
  return /^[1-9]\d*$/.test(minor);
}

export function MoneyDisplay({
  minor,
  className,
  colorBySign = false,
}: {
  minor: string;
  className?: string;
  /** When true, positive amounts render green and negative amounts red. */
  colorBySign?: boolean;
}) {
  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        colorBySign &&
          isPositiveMinor(minor) &&
          'text-emerald-600 dark:text-emerald-400',
        colorBySign &&
          isNegativeMinor(minor) &&
          'text-rose-600 dark:text-rose-400',
        className,
      )}
    >
      {formatMinorAsUsd(minor)}
    </span>
  );
}
