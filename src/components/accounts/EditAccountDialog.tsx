import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import type { AccountFieldsFragment, AccountType } from '@/__generated__/graphql';
import {
  AccountsDocument,
  DeleteAccountDocument,
  UpdateAccountDocument,
} from '@/__generated__/graphql';
import { ACCOUNT_TYPE_OPTIONS } from '@/constants/account-type';
import { LIVE_FORM_OPTIONS } from '@/constants/form-options';
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
import { FieldError } from '@/lib/form/FieldError';
import { requiredTrimmed } from '@/lib/form/validators';
import type { EditAccountFormInput } from '@/types/edit-account-form';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
}: {
  account: AccountFieldsFragment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const client = useApolloClient();
  const [updateAccount, { loading: updating }] = useMutation(UpdateAccountDocument);
  const [deleteAccount, { loading: deleting }] = useMutation(DeleteAccountDocument);

  const canChangeType = (account?.ledgerEntryCount ?? 0) === 0;
  const canDelete = canChangeType;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isValid, isDirty, errors },
  } = useForm<EditAccountFormInput>({
    ...LIVE_FORM_OPTIONS,
    defaultValues: {
      name: '',
      type: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!account) return;

    reset({
      name: account.name,
      type: account.type,
      isActive: account.isActive,
    });
  }, [account, reset]);

  const isActive = useWatch({ control, name: 'isActive' });

  const submitForm = handleSubmit(async (values) => {
    if (!account || !values.type || !isDirty) return;

    try {
      await updateAccount({
        variables: {
          id: account.id,
          input: {
            name: values.name.trim(),
            type: values.type,
            isActive: values.isActive,
          },
        },
      });
      await client.refetchQueries({ include: [AccountsDocument] });
      toast.success('Account updated');
      onOpenChange(false);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error, 'Unable to update account.'));
    }
  });

  const handleDeactivate = async () => {
    if (!account || account.isActive === false) return;

    try {
      await updateAccount({
        variables: {
          id: account.id,
          input: { isActive: false },
        },
      });
      await client.refetchQueries({ include: [AccountsDocument] });
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
      });
      await client.refetchQueries({ include: [AccountsDocument] });
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
        <form onSubmit={submitForm} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-account-name">Account Name</Label>
            <Input
              id="edit-account-name"
              {...register('name', { validate: requiredTrimmed })}
              aria-invalid={Boolean(errors.name)}
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-account-type">Account Type</Label>
            <Controller
              control={control}
              name="type"
              rules={{
                validate: (value) =>
                  value ? true : 'Account type is required.',
              }}
              render={({ field }) => (
                <Select
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value as AccountType)}
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
              )}
            />
            <FieldError message={errors.type?.message} />
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
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="edit-account-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
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
              <Button type="submit" disabled={!isValid || !isDirty || updating}>
                {updating ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
