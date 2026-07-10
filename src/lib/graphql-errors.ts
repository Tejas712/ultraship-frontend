const ERROR_MESSAGES: Record<string, string> = {
  DUPLICATE_TRANSACTION_REFERENCE: 'Transaction reference already exists.',
  UNBALANCED_LEDGER_TRANSACTION: 'Transaction is not balanced.',
  UNSUPPORTED_CURRENCY: 'Only USD transactions are currently supported.',
  ACCOUNT_NOT_FOUND: 'One or more accounts were not found.',
  ACCOUNT_INACTIVE: 'One or more accounts are inactive.',
  INVALID_LEDGER_AMOUNT: 'One or more amounts are invalid.',
  INVALID_REFERENCE: 'Transaction reference is invalid.',
  INVALID_LEDGER_ACCOUNTS: 'Debit and credit accounts must be different.',
  INVALID_ACCOUNT_NAME: 'Account name is invalid.',
  ACCOUNT_TYPE_LOCKED:
    'Account type cannot be changed after ledger entries exist.',
  ACCOUNT_HAS_LEDGER_ENTRIES:
    'This account has ledger entries and cannot be deleted. Deactivate it instead.',
};

type GraphQLErrorLike = {
  message: string;
  extensions?: { code?: string };
};

type ApolloErrorLike = {
  graphQLErrors?: GraphQLErrorLike[];
  message?: string;
};

export function getGraphQLErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const apolloError = error as ApolloErrorLike;
  const first = apolloError.graphQLErrors?.[0];

  if (first?.extensions?.code) {
    const mapped = ERROR_MESSAGES[first.extensions.code];
    if (mapped) {
      return mapped;
    }
  }

  if (first?.message) {
    return first.message;
  }

  if (apolloError.message && !apolloError.message.includes('Failed to fetch')) {
    return apolloError.message;
  }

  return fallback;
}
