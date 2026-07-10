import { useEffect } from 'react';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { LIVE_FORM_OPTIONS } from '@/constants/form-options';

export function useDialogForm<T extends FieldValues>(
  open: boolean,
  defaultValues: DefaultValues<T>,
  options?: Omit<UseFormProps<T>, 'defaultValues'>,
): UseFormReturn<T> {
  const form = useForm<T>({
    ...LIVE_FORM_OPTIONS,
    defaultValues,
    ...options,
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  return form;
}
