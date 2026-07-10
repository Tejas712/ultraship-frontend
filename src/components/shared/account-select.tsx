import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { AccountFieldsFragment } from '@/__generated__/graphql';
import { AccountTypeBadge } from '@/components/shared/account-type-badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function AccountSelect({
  accounts,
  value,
  onChange,
  disabled,
  excludeAccountId,
  activeOnly = true,
}: {
  accounts: AccountFieldsFragment[];
  value: string;
  onChange: (accountId: string) => void;
  disabled?: boolean;
  excludeAccountId?: string;
  activeOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectableAccounts = accounts.filter(
    (account) =>
      (!activeOnly || account.isActive) && account.id !== excludeAccountId,
  );
  const selected = selectableAccounts.find((account) => account.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          'inline-flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
        )}
      >
        {selected ? (
          <span className="truncate text-left">
            {selected.name}
            <span className="ml-2 text-muted-foreground">{selected.type}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Select account…</span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search accounts…" />
          <CommandList>
            <CommandEmpty>No active accounts found.</CommandEmpty>
            <CommandGroup>
              {selectableAccounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={`${account.name} ${account.type}`}
                  onSelect={() => {
                    onChange(account.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      value === account.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="truncate">{account.name}</span>
                    <AccountTypeBadge type={account.type} />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
