import { GRAPHQL_ERROR_MESSAGES } from '@/constants/graphql-error-messages';
import type { ApolloErrorLike } from '@/types/graphql-error';

export function getGraphQLErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const apolloError = error as ApolloErrorLike;
  const first = apolloError.graphQLErrors?.[0];

  if (first?.extensions?.code) {
    const mapped = GRAPHQL_ERROR_MESSAGES[first.extensions.code];
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
