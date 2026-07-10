import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  AccountsDocument,
  RecordLedgerTransactionDocument,
} from '@/__generated__/graphql';
import { AccountSelect } from '@/components/shared/account-select';
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
import { getGraphQLErrorMessage } from '@/lib/graphql-errors';
import { formatMinorAsUsd, parseUsdToMinor } from '@/lib/money';

export function RecordTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}) {
  const { data: accountsData, loading: accountsLoading } = useQuery(
    AccountsDocument,
    { skip: !open },
  );
  const [recordTransaction, { loading: submitting }] = useMutation(
    RecordLedgerTransactionDocument,
  );

  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [amountUsd, setAmountUsd] = useState('');

  const accounts = useMemo(
    () => (accountsData?.accounts ?? []).filter((account) => account.isActive),
    [accountsData?.accounts],
  );

  const amountMinor = useMemo(() => parseUsdToMinor(amountUsd), [amountUsd]);

  const reset = () => {
    setReference('');
    setDescription('');
    setDebitAccountId('');
    setCreditAccountId('');
    setAmountUsd('');
  };

  const canSubmit = useMemo(() => {
    return (
      reference.trim().length > 0 &&
      debitAccountId.length > 0 &&
      creditAccountId.length > 0 &&
      debitAccountId !== creditAccountId &&
      amountMinor !== null
    );
  }, [amountMinor, creditAccountId, debitAccountId, reference]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !amountMinor) return;

    try {
      await recordTransaction({
        variables: {
          input: {
            reference: reference.trim(),
            description: description.trim() || null,
            debitAccountId,
            creditAccountId,
            amountMinor,
          },
        },
      });

      await onSuccess?.();

      toast.success('Transaction recorded');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getGraphQLErrorMessage(error, 'Unable to record transaction.'),
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ledger-reference">Reference</Label>
            <Input
              id="ledger-reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="TXN-001"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ledger-description">Description (optional)</Label>
            <Input
              id="ledger-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Payment for freight services"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Debit Account</Label>
              <AccountSelect
                accounts={accounts}
                value={debitAccountId}
                onChange={setDebitAccountId}
                excludeAccountId={creditAccountId}
                disabled={accountsLoading}
                activeOnly={false}
              />
            </div>
            <div className="space-y-2">
              <Label>Credit Account</Label>
              <AccountSelect
                accounts={accounts}
                value={creditAccountId}
                onChange={setCreditAccountId}
                excludeAccountId={debitAccountId}
                disabled={accountsLoading}
                activeOnly={false}
              />
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
              value={amountUsd}
              onChange={(event) => setAmountUsd(event.target.value)}
            />
            {amountUsd.trim() && amountMinor === null ? (
              <p className="text-sm text-destructive">
                Enter a valid USD amount with at most two decimal places.
              </p>
            ) : null}
            {amountMinor ? (
              <p className="text-sm text-muted-foreground">
                Minor units: {amountMinor} ({formatMinorAsUsd(amountMinor)})
              </p>
            ) : null}
          </div>
          {debitAccountId &&
          creditAccountId &&
          debitAccountId === creditAccountId ? (
            <p className="text-sm text-destructive">
              Debit and credit accounts must be different.
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || submitting}>
              {submitting ? 'Recording…' : 'Record Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
