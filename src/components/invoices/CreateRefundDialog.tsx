import { useDialogForm } from '@/lib/form/useDialogForm';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import type { PaymentFieldsFragment } from '@/__generated__/graphql';
import {
  AccountsDocument,
  CreateRefundDocument,
  InvoicesDocument,
  LedgerTransactionsDocument,
} from '@/__generated__/graphql';
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
import { DEFAULT_CREATE_REFUND_FORM_VALUES } from '@/constants/forms';
import { FieldError } from '@/lib/form/FieldError';
import {
  parseUsdAmountMinor,
  requiredTrimmed,
  validateUsdAmount,
} from '@/lib/form/validators';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';
import { formatMinorAsUsd } from '@/utils/money';

export function CreateRefundDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: {
  payment: PaymentFieldsFragment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}) {
  const client = useApolloClient();
  const [createRefund, { loading: submitting }] = useMutation(CreateRefundDocument);

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useDialogForm(open, DEFAULT_CREATE_REFUND_FORM_VALUES);

  const submitForm = handleSubmit(async (values) => {
    try {
      await createRefund({
        variables: {
          input: {
            paymentId: payment.id,
            externalRefundId: values.externalRefundId.trim(),
            amountMinor: parseUsdAmountMinor(values.amountUsd),
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
      toast.success('Refund created');
      onOpenChange(false);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error, 'Unable to create refund.'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create refund</DialogTitle>
          <DialogDescription>
            Refund payment {payment.externalPaymentId}. Refundable amount:{' '}
            {formatMinorAsUsd(payment.refundableAmount)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submitForm} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refund-reference">Refund reference</Label>
            <Input
              id="refund-reference"
              {...register('externalRefundId', { validate: requiredTrimmed })}
              placeholder="REF-ref_12345"
              autoFocus
              aria-invalid={Boolean(errors.externalRefundId)}
            />
            <FieldError message={errors.externalRefundId?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refund-amount">Amount (USD)</Label>
            <Input
              id="refund-amount"
              inputMode="decimal"
              {...register('amountUsd', { validate: validateUsdAmount })}
              placeholder="100.00"
              aria-invalid={Boolean(errors.amountUsd)}
            />
            <FieldError message={errors.amountUsd?.message} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting ? 'Creating…' : 'Create refund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
