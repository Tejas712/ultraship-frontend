import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMinorAsUsd } from '@/utils/money';

export function TransactionSummary({
  debitTotal,
  creditTotal,
  difference,
  balanced,
}: {
  debitTotal: string;
  creditTotal: string;
  difference: string;
  balanced: boolean;
}) {
  const diffAbs = difference.startsWith('-') ? difference.slice(1) : difference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transaction Summary</CardTitle>
          <Badge
            variant="outline"
            className={
              balanced
                ? 'border-emerald-500/30 text-emerald-300'
                : 'border-amber-500/30 text-amber-300'
            }
          >
            {balanced ? 'Balanced' : 'Out of balance'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Total Debits</p>
          <p className="text-lg font-semibold">
            <MoneyDisplay minor={debitTotal} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Credits</p>
          <p className="text-lg font-semibold">
            <MoneyDisplay minor={creditTotal} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Difference</p>
          <p className="text-lg font-semibold">
            {balanced
              ? formatMinorAsUsd('0')
              : `Out of balance by ${formatMinorAsUsd(diffAbs)}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
