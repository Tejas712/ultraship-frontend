import type { UseFormProps } from 'react-hook-form';

/** Shared React Hook Form options for live validation without stale derived state. */
export const LIVE_FORM_OPTIONS = {
  mode: 'onChange',
  reValidateMode: 'onChange',
} as const satisfies Partial<UseFormProps>;
