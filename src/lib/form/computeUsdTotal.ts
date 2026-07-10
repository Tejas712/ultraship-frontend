import { parseUsdToMinor } from '@/utils/money';

/** Sum valid USD line-item amounts. Returns null when no valid amounts exist. */
export function computeUsdTotalMinor(
  amountsUsd: Array<string | undefined | null>,
): string | null {
  const amounts = amountsUsd
    .map((amountUsd) => parseUsdToMinor(amountUsd ?? ''))
    .filter((amount): amount is string => amount !== null);

  if (amounts.length === 0) {
    return null;
  }

  return amounts
    .reduce((sum, amount) => (BigInt(sum) + BigInt(amount)).toString(), '0');
}
