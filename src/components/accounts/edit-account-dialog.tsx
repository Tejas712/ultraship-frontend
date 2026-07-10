import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import type { AccountFieldsFragment, AccountType } from '@/__generated__/graphql';
import {
  AccountsDocument,
  DeleteAccountDocument,
  UpdateAccountDocument,
} from '@/__generated__/graphql';
import { ACCOUNT_TYPE_OPTIONS } from '@/components/shared/account-type-badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getGraphQLErrorMessage } from '@/lib/graphql-errors';

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
}: {
  account: AccountFieldsFragment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [updateAccount, { loading: updating }] = useMutation(UpdateAccountDocument);
  const [deleteAccount, { loading: deleting }] = useMutation(DeleteAccountDocument);

  const canChangeType = (account?.ledgerEntryCount ?? 0) === 0;
  const canDelete = canChangeType;

  useEffect(() => {
    if (!account) return;
    setName(account.name);
    setType(account.type);
    setIsActive(account.isActive);
  }, [account]);

  const hasChanges = useMemo(() => {
    if (!account || !type) return false;
    return (
      name.trim() !== account.name ||
      type !== account.type ||
      isActive !== account.isActive
    );
  }, [account, isActive, name, type]);

  const isValid = useMemo(() => name.trim().length > 0 && type !== null, [name, type]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account || !isValid || !type || !hasChanges) return;

    try {
      await updateAccount({
        variables: {
          id: account.id,
          input: {
            name: name.trim(),
            type,
            isActive,
          },
        },
        refetchQueries: [{ query: AccountsDocument }],
      });
      toast.success('Account updated');
      onOpenChange(false);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error, 'Unable to update account.'));
    }
  };

  const handleDeactivate = async () => {
    if (!account || account.isActive === false) return;

    try {
      await updateAccount({
        variables: {
          id: account.id,
          input: { isActive: false },
        },
        refetchQueries: [{ query: AccountsDocument }],
      });
      toast.success('Account deactivated');
      onOpenChange(false);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error, 'Unable to deactivate account.'));
    }
  };

  const handleDelete = async () => {
    if (!account || !canDelete) return;

    try {
      await deleteAccount({
        variables: { id: account.id },
        refetchQueries: [{ query: AccountsDocument }],
      });
      toast.success('Account deleted');
      onOpenChange(false);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error, 'Unable to delete account.'));
    }
  };

  if (!account) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update account details. Currency stays fixed to USD.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-account-name">Account Name</Label>
            <Input
              id="edit-account-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-account-type">Account Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as AccountType)}
              disabled={!canChangeType}
            >
              <SelectTrigger id="edit-account-type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canChangeType ? (
              <p className="text-sm text-muted-foreground">
                Type is locked because this account has ledger entries.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={account.currency} disabled readOnly />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="edit-account-active">Active</Label>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? 'Account can be used in transactions.'
                  : 'Account is inactive and hidden from new transactions.'}
              </p>
            </div>
            <Switch
              id="edit-account-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex w-full gap-2 sm:w-auto">
              {canDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting || updating}
                  onClick={() => void handleDelete()}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={deleting || updating || !account.isActive}
                  onClick={() => void handleDeactivate()}
                >
                  Deactivate
                </Button>
              )}
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || !hasChanges || updating}>
                {updating ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
