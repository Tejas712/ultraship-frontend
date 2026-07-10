import type { AccountType } from '@/__generated__/graphql';

export type EditAccountFormInput = {
  name: string;
  type: AccountType | '';
  isActive: boolean;
};
