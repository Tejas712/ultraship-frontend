import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Pencil, Plus } from 'lucide-react';
import { AccountsDocument } from '@/__generated__/graphql';
import type { AccountFieldsFragment, AccountType } from '@/__generated__/graphql';
import { AccountActiveSwitch } from '@/components/accounts/AccountActiveSwitch';
import { CreateAccountDialog } from '@/components/accounts/CreateAccountDialog';
import { EditAccountDialog } from '@/components/accounts/EditAccountDialog';
import { ACCOUNT_TYPE_OPTIONS } from '@/constants/account-type';
import { AccountTypeBadge } from '@/components/shared/AccountTypeBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AccountsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountFieldsFragment | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const { data, loading, error, refetch } = useQuery(AccountsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const openEditDialog = (account: AccountFieldsFragment) => {
    setSelectedAccount(account);
    setEditDialogOpen(true);
  };

  const accounts = useMemo(() => {
    const items = data?.accounts ?? [];
    return items.filter((account) => {
      const matchesSearch = account.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType =
        typeFilter === 'ALL' || account.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data?.accounts, search, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage ledger accounts and review derived balances."
        action={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Create Account
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by account name…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value ?? 'ALL')}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message="Unable to load accounts."
          onRetry={() => refetch()}
        />
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet."
          description="Create your first ledger account to begin recording transactions."
          action={
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              Create Account
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <AccountTypeBadge type={account.type as AccountType} />
                  </TableCell>
                  <TableCell>{account.currency}</TableCell>
                  <TableCell className="text-right">
                    <MoneyDisplay
                      minor={account.balanceMinor}
                      colorBySign
                    />
                  </TableCell>
                  <TableCell>
                    <AccountActiveSwitch
                      accountId={account.id}
                      accountName={account.name}
                      isActive={account.isActive}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${account.name}`}
                      onClick={() => openEditDialog(account)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateAccountDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <EditAccountDialog
        account={selectedAccount}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedAccount(null);
        }}
      />
    </div>
  );
}
