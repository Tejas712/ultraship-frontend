import { useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  AccountsDocument,
  LedgerTransactionsDocument,
  RecordLedgerTransactionDocument,
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
import { DEFAULT_RECORD_TRANSACTION_FORM_VALUES } from '@/constants/forms';
import { FieldError } from '@/lib/form/FieldError';
import { useDialogForm } from '@/lib/form/useDialogForm';
import {
  parseUsdAmountMinor,
  requiredTrimmed,
  validateUsdAmount,
} from '@/lib/form/validators';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';
import { formatMinorAsUsd, parseUsdToMinor } from '@/utils/money';

export function RecordTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}) {
  const client = useApolloClient();
  const { data: accountsData, loading: accountsLoading } = useQuery(
    AccountsDocument,
    { skip: !open },
  );
  const [recordTransaction, { loading: submitting }] = useMutation(
    RecordLedgerTransactionDocument,
  );

  const accounts = useMemo(
    () => (accountsData?.accounts ?? []).filter((account) => account.isActive),
    [accountsData?.accounts],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { isValid, errors },
  } = useDialogForm(open, DEFAULT_RECORD_TRANSACTION_FORM_VALUES);

  const debitAccountId = useWatch({ control, name: 'debitAccountId' });
  const creditAccountId = useWatch({ control, name: 'creditAccountId' });
  const amountUsd = useWatch({ control, name: 'amountUsd' });
  const amountMinor = parseUsdToMinor(amountUsd ?? '');

  const submitForm = handleSubmit(async (values) => {
    try {
      await recordTransaction({
        variables: {
          input: {
            reference: values.reference.trim(),
            description: values.description.trim() || null,
            debitAccountId: values.debitAccountId,
            creditAccountId: values.creditAccountId,
            amountMinor: parseUsdAmountMinor(values.amountUsd),
          },
        },
      });

      await client.refetchQueries({
        include: [LedgerTransactionsDocument, AccountsDocument],
      });

      await onSuccess?.();

      toast.success('Transaction recorded');
      reset(DEFAULT_RECORD_TRANSACTION_FORM_VALUES);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getGraphQLErrorMessage(error, 'Unable to record transaction.'),
      );
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset(DEFAULT_RECORD_TRANSACTION_FORM_VALUES);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>
            Create a balanced double-entry journal transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submitForm} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ledger-reference">Reference</Label>
            <Input
              id="ledger-reference"
              {...register('reference', { validate: requiredTrimmed })}
              placeholder="TXN-001"
              autoFocus
              aria-invalid={Boolean(errors.reference)}
            />
            <FieldError message={errors.reference?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ledger-description">Description (optional)</Label>
            <Input
              id="ledger-description"
              {...register('description')}
              placeholder="Payment for freight services"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Debit Account</Label>
              <Controller
                control={control}
                name="debitAccountId"
                rules={{
                  validate: (value) => {
                    const required = requiredTrimmed(value);
                    if (required !== true) return required;
                    return (
                      value !== creditAccountId ||
                      'Debit and credit accounts must be different.'
                    );
                  },
                }}
                render={({ field }) => (
                  <AccountSelect
                    accounts={accounts}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      void trigger(['debitAccountId', 'creditAccountId']);
                    }}
                    excludeAccountId={creditAccountId}
                    disabled={accountsLoading}
                    activeOnly={false}
                  />
                )}
              />
              <FieldError message={errors.debitAccountId?.message} />
            </div>
            <div className="space-y-2">
              <Label>Credit Account</Label>
              <Controller
                control={control}
                name="creditAccountId"
                rules={{
                  validate: (value) => {
                    const required = requiredTrimmed(value);
                    if (required !== true) return required;
                    return (
                      value !== debitAccountId ||
                      'Debit and credit accounts must be different.'
                    );
                  },
                }}
                render={({ field }) => (
                  <AccountSelect
                    accounts={accounts}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      void trigger(['debitAccountId', 'creditAccountId']);
                    }}
                    excludeAccountId={debitAccountId}
                    disabled={accountsLoading}
                    activeOnly={false}
                  />
                )}
              />
              <FieldError message={errors.creditAccountId?.message} />
            </div>
          </div>
          {!accountsLoading && accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active accounts available.
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="ledger-amount">Amount (USD)</Label>
            <Input
              id="ledger-amount"
              inputMode="decimal"
              placeholder="1000.00"
              {...register('amountUsd', { validate: validateUsdAmount })}
              aria-invalid={Boolean(errors.amountUsd)}
            />
            <FieldError message={errors.amountUsd?.message} />
            {amountMinor ? (
              <p className="text-sm text-muted-foreground">
                Minor units: {amountMinor} ({formatMinorAsUsd(amountMinor)})
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting ? 'Recording…' : 'Record Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
