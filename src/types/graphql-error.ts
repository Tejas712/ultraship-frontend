export type GraphQLErrorLike = {
  message: string;
  extensions?: { code?: string };
};

export type ApolloErrorLike = {
  graphQLErrors?: GraphQLErrorLike[];
  message?: string;
};
