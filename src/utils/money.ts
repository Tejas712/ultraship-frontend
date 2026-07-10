const INTEGER_DIGITS = /^\d+$/;
const USD_INPUT_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/;

function formatIntegerWithCommas(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Format a minor-unit decimal string as USD, e.g. "10050" → "$100.50" */
export function formatMinorAsUsd(minor: string | number | bigint): string {
  const minorStr = typeof minor === 'string' ? minor : String(minor);

  if (!minorStr || !/^-?\d+$/.test(minorStr)) {
    return '—';
  }

  const negative = minorStr.startsWith('-');
  const abs = negative ? minorStr.slice(1) : minorStr;
  const padded = abs.padStart(3, '0');
  const dollars = padded.slice(0, -2) || '0';
  const cents = padded.slice(-2);

  return `${negative ? '-' : ''}$${formatIntegerWithCommas(dollars)}.${cents}`;
}

/** Parse USD major-unit input to minor-unit string. Returns null if invalid. */
export function parseUsdToMinor(input: string): string | null {
  const cleaned = input.trim().replace(/^\$/, '');
  if (!cleaned) {
    return null;
  }

  if (cleaned.startsWith('-')) {
    return null;
  }

  const match = cleaned.match(USD_INPUT_PATTERN);
  if (!match) {
    return null;
  }

  const [, whole, fraction = ''] = match;
  const paddedFraction = fraction.padEnd(2, '0');
  const minor = BigInt(`${whole}${paddedFraction}`);

  if (minor <= 0n) {
    return null;
  }

  return minor.toString();
}

/** Sum minor-unit strings using BigInt arithmetic. */
export function sumMinorStrings(values: string[]): string {
  const total = values.reduce(
    (acc, value) => acc + BigInt(value && INTEGER_DIGITS.test(value) ? value : '0'),
    0n,
  );
  return total.toString();
}

/** Subtract b from a (both minor-unit strings). */
export function subtractMinorStrings(a: string, b: string): string {
  return (BigInt(a) - BigInt(b)).toString();
}

/** Compare two minor-unit strings. Returns negative, zero, or positive. */
export function compareMinorStrings(a: string, b: string): number {
  const diff = BigInt(a) - BigInt(b);
  if (diff < 0n) return -1;
  if (diff > 0n) return 1;
  return 0;
}

/** Convert minor-unit string to USD display without currency symbol. */
export function formatMinorAsUsdPlain(minor: string): string {
  return formatMinorAsUsd(minor).replace(/^\$/, '');
}
