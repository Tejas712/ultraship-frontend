import { Controller } from 'react-hook-form';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import type { InvoiceFieldsFragment } from '@/__generated__/graphql';
import {
  AccountsDocument,
  ApplyInvoicePaymentDocument,
  InvoicesDocument,
  LedgerTransactionsDocument,
} from '@/__generated__/graphql';
import { AccountSelect } from '@/components/shared/AccountSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_APPLY_PAYMENT_FORM_VALUES } from '@/constants/forms';
import { FieldError } from '@/lib/form/FieldError';
import { useDialogForm } from '@/lib/form/useDialogForm';
import {
  parseUsdAmountMinor,
  requiredTrimmed,
  validateUsdAmount,
} from '@/lib/form/validators';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';
import { formatMinorAsUsd } from '@/utils/money';

export function ApplyPaymentDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: {
  invoice: InvoiceFieldsFragment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}) {
  const client = useApolloClient();
  const { data: accountsData, loading: accountsLoading } = useQuery(
    AccountsDocument,
    { skip: !open },
  );
  const [applyPayment, { loading: paying }] = useMutation(
    ApplyInvoicePaymentDocument,
  );

  const accounts = accountsData?.accounts ?? [];

  const {
    control,
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useDialogForm(open, DEFAULT_APPLY_PAYMENT_FORM_VALUES);

  const submitForm = handleSubmit(async (values) => {
    try {
      await applyPayment({
        variables: {
          input: {
            invoiceId: invoice.id,
            externalPaymentId: values.externalPaymentId.trim(),
            amountMinor: parseUsdAmountMinor(values.amountUsd),
            paymentAccountId: values.paymentAccountId,
          },
        },
      });
      await client.refetchQueries({
        include: [
          InvoicesDocument,
          LedgerTransactionsDocument,
          AccountsDocument,
        ],
      });
      await onSuccess?.();
      toast.success('Payment applied');
      onOpenChange(false);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error, 'Unable to apply payment.'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply payment</DialogTitle>
          <DialogDescription>
            Record a payment against {invoice.invoiceNumber}. Remaining balance:{' '}
            {formatMinorAsUsd(invoice.remainingMinor)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submitForm} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-reference">Payment reference</Label>
            <Input
              id="payment-reference"
              {...register('externalPaymentId', { validate: requiredTrimmed })}
              placeholder="PAY-pay_12345"
              autoFocus
              aria-invalid={Boolean(errors.externalPaymentId)}
            />
            <FieldError message={errors.externalPaymentId?.message} />
          </div>
          <div className="space-y-2">
            <Label>Pay from account</Label>
            <Controller
              control={control}
              name="paymentAccountId"
              rules={{ validate: requiredTrimmed }}
              render={({ field }) => (
                <AccountSelect
                  accounts={accounts}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={accountsLoading}
                />
              )}
            />
            <FieldError message={errors.paymentAccountId?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Amount (USD)</Label>
            <Input
              id="payment-amount"
              inputMode="decimal"
              {...register('amountUsd', { validate: validateUsdAmount })}
              placeholder="500.00"
              aria-invalid={Boolean(errors.amountUsd)}
            />
            <FieldError message={errors.amountUsd?.message} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || paying}>
              {paying ? 'Applying…' : 'Apply payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
