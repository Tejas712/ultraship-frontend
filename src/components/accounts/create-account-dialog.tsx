import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import type { AccountType } from '@/__generated__/graphql';
import {
  AccountsDocument,
  CreateAccountDocument,
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
import { getGraphQLErrorMessage } from '@/lib/graphql-errors';

export function CreateAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType | null>(null);
  const { refetch } = useQuery(AccountsDocument);
  const [createAccount, { loading }] = useMutation(CreateAccountDocument);

  const reset = () => {
    setName('');
    setType(null);
  };

  const isValid = useMemo(() => name.trim().length > 0 && type !== null, [name, type]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || !type) return;

    try {
      await createAccount({
        variables: {
          input: {
            name: name.trim(),
            type,
          },
        },
      });
      await refetch();
      toast.success('Account created');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getGraphQLErrorMessage(error, 'Unable to create account.'),
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Add a new ledger account. Currency is fixed to USD.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Operating Bank"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-type">Account Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as AccountType)}
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
