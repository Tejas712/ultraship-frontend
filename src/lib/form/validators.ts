import { parseUsdToMinor } from '@/utils/money';

export function getLocalDateInputValue(date = new Date()): string {
  return date.toLocaleDateString('en-CA');
}

export function requiredTrimmed(value: string | null | undefined): true | string {
  return value?.trim() ? true : 'This field is required.';
}

export function validateDueDate(
  value: string | null | undefined,
  options?: { allowPast?: boolean },
): true | string {
  const required = requiredTrimmed(value);
  if (required !== true) {
    return required;
  }

  if (!options?.allowPast && value! < getLocalDateInputValue()) {
    return 'Due date cannot be in the past.';
  }

  return true;
}

export function validateUsdAmount(value: string | null | undefined): true | string {
  if (!value?.trim()) {
    return 'Amount is required.';
  }

  if (parseUsdToMinor(value) === null) {
    return 'Enter a valid USD amount with at most two decimal places.';
  }

  return true;
}

export function parseUsdAmountMinor(value: string): string {
  const minor = parseUsdToMinor(value.trim());
  if (!minor) {
    throw new Error('Invalid USD amount');
  }
  return minor;
}
