import { Controller } from 'react-hook-form';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import type { AccountType } from '@/__generated__/graphql';
import {
  AccountsDocument,
  CreateAccountDocument,
} from '@/__generated__/graphql';
import { ACCOUNT_TYPE_OPTIONS } from '@/constants/account-type';
import { DEFAULT_CREATE_ACCOUNT_FORM_VALUES } from '@/constants/forms';
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
import { FieldError } from '@/lib/form/FieldError';
import { useDialogForm } from '@/lib/form/useDialogForm';
import { requiredTrimmed } from '@/lib/form/validators';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';

export function CreateAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const client = useApolloClient();
  const [createAccount, { loading }] = useMutation(CreateAccountDocument);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useDialogForm(open, DEFAULT_CREATE_ACCOUNT_FORM_VALUES);

  const submitForm = handleSubmit(async (values) => {
    if (!values.type) return;

    try {
      await createAccount({
        variables: {
          input: {
            name: values.name.trim(),
            type: values.type,
          },
        },
      });
      await client.refetchQueries({ include: [AccountsDocument] });
      toast.success('Account created');
      reset(DEFAULT_CREATE_ACCOUNT_FORM_VALUES);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getGraphQLErrorMessage(error, 'Unable to create account.'),
      );
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset(DEFAULT_CREATE_ACCOUNT_FORM_VALUES);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Add a new ledger account. Currency is fixed to USD.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submitForm} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              {...register('name', { validate: requiredTrimmed })}
              placeholder="Operating Bank"
              autoFocus
              aria-invalid={Boolean(errors.name)}
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-type">Account Type</Label>
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
                >
                  <SelectTrigger id="account-type" className="w-full">
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
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value="USD" disabled readOnly />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
