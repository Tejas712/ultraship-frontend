import { useApolloClient, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  AccountsDocument,
  UpdateAccountDocument,
} from '@/__generated__/graphql';
import { Switch } from '@/components/ui/switch';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';

export function AccountActiveSwitch({
  accountId,
  accountName,
  isActive,
}: {
  accountId: string;
  accountName: string;
  isActive: boolean;
}) {
  const client = useApolloClient();
  const [updateAccount, { loading }] = useMutation(UpdateAccountDocument);

  const handleChange = async (checked: boolean) => {
    try {
      await updateAccount({
        variables: {
          id: accountId,
          input: { isActive: checked },
        },
      });
      await client.refetchQueries({ include: [AccountsDocument] });
      toast.success(
        checked ? `${accountName} is now active` : `${accountName} is now inactive`,
      );
    } catch (error) {
      toast.error(
        getGraphQLErrorMessage(error, 'Unable to update account status.'),
      );
    }
  };

  return (
    <Switch
      checked={isActive}
      disabled={loading}
      aria-label={`Toggle active status for ${accountName}`}
      onClick={(event) => event.stopPropagation()}
      onCheckedChange={(checked) => void handleChange(checked)}
    />
  );
}
