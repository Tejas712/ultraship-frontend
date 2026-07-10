import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useQuery } from '@apollo/client/react';
import { Plus, Trash2 } from 'lucide-react';
import type { InvoiceFieldsFragment } from '@/__generated__/graphql';
import { AccountsDocument } from '@/__generated__/graphql';
import { AccountSelect } from '@/components/shared/AccountSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LIVE_FORM_OPTIONS } from '@/constants/form-options';
import {
  DEFAULT_INVOICE_FORM_VALUES,
  EMPTY_INVOICE_LINE_ITEM,
} from '@/constants/invoice-form';
import { FieldError } from '@/lib/form/FieldError';
import { computeUsdTotalMinor } from '@/lib/form/computeUsdTotal';
import {
  parseUsdAmountMinor,
  requiredTrimmed,
  validateDueDate,
  validateUsdAmount,
  getLocalDateInputValue,
} from '@/lib/form/validators';
import type { InvoiceFormInput, InvoiceFormValues } from '@/types/invoice-form';
import { invoiceToFormDefaults } from '@/utils/invoice-form';
import { formatMinorAsUsd } from '@/utils/money';

export type { InvoiceFormValues } from '@/types/invoice-form';

export function InvoiceForm({
  onSubmit,
  onCancel,
  submitLabel = 'Create Invoice',
  submitting = false,
  initialInvoice,
}: {
  onSubmit: (input: InvoiceFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  submitting?: boolean;
  initialInvoice?: InvoiceFieldsFragment;
}) {
  const { data: accountsData, loading: accountsLoading } = useQuery(AccountsDocument);
  const accounts = accountsData?.accounts ?? [];

  const {
    control,
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { isValid, errors },
  } = useForm<InvoiceFormInput>({
    ...LIVE_FORM_OPTIONS,
    defaultValues: initialInvoice
      ? invoiceToFormDefaults(initialInvoice)
      : DEFAULT_INVOICE_FORM_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const minDueDate = getLocalDateInputValue();
  const isEditing = Boolean(initialInvoice);

  useEffect(() => {
    reset(
      initialInvoice ? invoiceToFormDefaults(initialInvoice) : DEFAULT_INVOICE_FORM_VALUES,
    );
  }, [initialInvoice, reset]);

  const lineItems = useWatch({ control, name: 'lineItems' }) ?? [];
  const expenseAccountId = useWatch({ control, name: 'expenseAccountId' });
  const payableAccountId = useWatch({ control, name: 'payableAccountId' });

  const totalMinor = computeUsdTotalMinor(
    lineItems.map((item) => item?.amountUsd),
  );

  const submitForm = handleSubmit(async (values) => {
    await onSubmit({
      invoiceNumber: values.invoiceNumber.trim(),
      vendorName: values.vendorName.trim(),
      dueDate: values.dueDate,
      expenseAccountId: values.expenseAccountId,
      payableAccountId: values.payableAccountId,
      lineItems: values.lineItems.map((item) => ({
        description: item.description.trim(),
        amountMinor: parseUsdAmountMinor(item.amountUsd),
      })),
    });
  });

  return (
    <form onSubmit={submitForm} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Basic information about this vendor invoice.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  {...register('invoiceNumber', { validate: requiredTrimmed })}
                  placeholder="INV-1001"
                  autoFocus
                  aria-invalid={Boolean(errors.invoiceNumber)}
                />
                <FieldError message={errors.invoiceNumber?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Vendor</Label>
                <Input
                  id="vendor-name"
                  {...register('vendorName', { validate: requiredTrimmed })}
                  placeholder="Acme Freight Co."
                  aria-invalid={Boolean(errors.vendorName)}
                />
                <FieldError message={errors.vendorName?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  min={isEditing ? undefined : minDueDate}
                  {...register('dueDate', {
                    validate: (value) =>
                      validateDueDate(value, { allowPast: isEditing }),
                  })}
                  aria-invalid={Boolean(errors.dueDate)}
                />
                <FieldError message={errors.dueDate?.message} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Accounts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose where the expense and payable will be recorded.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Expense Account</Label>
                <Controller
                  control={control}
                  name="expenseAccountId"
                  rules={{
                    validate: (value) => {
                      const required = requiredTrimmed(value);
                      if (required !== true) return required;
                      return (
                        value !== payableAccountId ||
                        'Expense and payable accounts must be different.'
                      );
                    },
                  }}
                  render={({ field }) => (
                    <AccountSelect
                      accounts={accounts}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        void trigger(['expenseAccountId', 'payableAccountId']);
                      }}
                      excludeAccountId={payableAccountId}
                      disabled={accountsLoading}
                    />
                  )}
                />
                <FieldError message={errors.expenseAccountId?.message} />
              </div>
              <div className="space-y-2">
                <Label>Payable Account</Label>
                <Controller
                  control={control}
                  name="payableAccountId"
                  rules={{
                    validate: (value) => {
                      const required = requiredTrimmed(value);
                      if (required !== true) return required;
                      return (
                        value !== expenseAccountId ||
                        'Expense and payable accounts must be different.'
                      );
                    },
                  }}
                  render={({ field }) => (
                    <AccountSelect
                      accounts={accounts}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        void trigger(['expenseAccountId', 'payableAccountId']);
                      }}
                      excludeAccountId={expenseAccountId}
                      disabled={accountsLoading}
                    />
                  )}
                />
                <FieldError message={errors.payableAccountId?.message} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:min-h-[28rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Line Items</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Add the products or services on this invoice.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                append({ ...EMPTY_INVOICE_LINE_ITEM });
                void trigger('lineItems');
              }}
            >
              <Plus className="size-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_140px_auto]">
              <span>Description</span>
              <span>Amount (USD)</span>
              <span className="sr-only">Actions</span>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-[1fr_140px_auto] sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <div className="space-y-1 sm:space-y-0">
                    <Label className="sm:sr-only">Description</Label>
                    <Input
                      {...register(`lineItems.${index}.description`, {
                        validate: requiredTrimmed,
                      })}
                      placeholder={`Line item ${index + 1}`}
                      aria-invalid={Boolean(errors.lineItems?.[index]?.description)}
                    />
                    <FieldError
                      message={errors.lineItems?.[index]?.description?.message}
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-0">
                    <Label className="sm:sr-only">Amount (USD)</Label>
                    <Input
                      inputMode="decimal"
                      {...register(`lineItems.${index}.amountUsd`, {
                        validate: validateUsdAmount,
                      })}
                      placeholder="100.00"
                      aria-invalid={Boolean(errors.lineItems?.[index]?.amountUsd)}
                    />
                    <FieldError
                      message={errors.lineItems?.[index]?.amountUsd?.message}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="justify-self-end sm:justify-self-auto"
                    disabled={fields.length === 1}
                    onClick={() => {
                      remove(index);
                      void trigger('lineItems');
                    }}
                    aria-label="Remove line item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <FieldError message={errors.lineItems?.root?.message} />
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Invoice total</span>
              <span className="text-lg font-semibold">
                {totalMinor ? formatMinorAsUsd(totalMinor) : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
