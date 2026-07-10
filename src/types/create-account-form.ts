import type { AccountType } from '@/__generated__/graphql';

export type CreateAccountFormInput = {
  name: string;
  type: AccountType | '';
};
