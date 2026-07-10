/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Accounts {\n  accounts {\n    ...AccountFields\n  }\n}\n\nquery Account($id: String!) {\n  account(id: $id) {\n    ...AccountFields\n  }\n}\n\nmutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    ...AccountFields\n  }\n}\n\nmutation UpdateAccount($id: String!, $input: UpdateAccountInput!) {\n  updateAccount(id: $id, input: $input) {\n    ...AccountFields\n  }\n}\n\nmutation DeleteAccount($id: String!) {\n  deleteAccount(id: $id) {\n    ...AccountFields\n  }\n}": typeof types.AccountsDocument,
    "fragment AccountFields on AccountModel {\n  id\n  name\n  type\n  currency\n  isActive\n  balanceMinor\n  ledgerEntryCount\n  createdAt\n  updatedAt\n}\n\nfragment LedgerAccountFields on LedgerAccountModel {\n  id\n  name\n  type\n  currency\n  isActive\n}\n\nfragment LedgerEntryFields on LedgerEntryModel {\n  id\n  entryType\n  amountMinor\n  createdAt\n  account {\n    ...LedgerAccountFields\n  }\n}\n\nfragment LedgerTransactionFields on LedgerTransactionModel {\n  id\n  reference\n  description\n  transactionDate\n  createdAt\n  updatedAt\n  entries {\n    ...LedgerEntryFields\n  }\n}": typeof types.AccountFieldsFragmentDoc,
    "query LedgerTransactions($pagination: PaginationInput, $reference: String) {\n  ledgerTransactions(pagination: $pagination, reference: $reference) {\n    totalCount\n    page\n    limit\n    offset\n    cursor\n    nextCursor\n    hasNextPage\n    hasPreviousPage\n    items {\n      ...LedgerTransactionFields\n    }\n  }\n}\n\nquery LedgerTransaction($id: String!) {\n  ledgerTransaction(id: $id) {\n    ...LedgerTransactionFields\n  }\n}\n\nmutation RecordLedgerTransaction($input: RecordLedgerTransactionInput!) {\n  recordLedgerTransaction(input: $input) {\n    ...LedgerTransactionFields\n  }\n}": typeof types.LedgerTransactionsDocument,
};
const documents: Documents = {
    "query Accounts {\n  accounts {\n    ...AccountFields\n  }\n}\n\nquery Account($id: String!) {\n  account(id: $id) {\n    ...AccountFields\n  }\n}\n\nmutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    ...AccountFields\n  }\n}\n\nmutation UpdateAccount($id: String!, $input: UpdateAccountInput!) {\n  updateAccount(id: $id, input: $input) {\n    ...AccountFields\n  }\n}\n\nmutation DeleteAccount($id: String!) {\n  deleteAccount(id: $id) {\n    ...AccountFields\n  }\n}": types.AccountsDocument,
    "fragment AccountFields on AccountModel {\n  id\n  name\n  type\n  currency\n  isActive\n  balanceMinor\n  ledgerEntryCount\n  createdAt\n  updatedAt\n}\n\nfragment LedgerAccountFields on LedgerAccountModel {\n  id\n  name\n  type\n  currency\n  isActive\n}\n\nfragment LedgerEntryFields on LedgerEntryModel {\n  id\n  entryType\n  amountMinor\n  createdAt\n  account {\n    ...LedgerAccountFields\n  }\n}\n\nfragment LedgerTransactionFields on LedgerTransactionModel {\n  id\n  reference\n  description\n  transactionDate\n  createdAt\n  updatedAt\n  entries {\n    ...LedgerEntryFields\n  }\n}": types.AccountFieldsFragmentDoc,
    "query LedgerTransactions($pagination: PaginationInput, $reference: String) {\n  ledgerTransactions(pagination: $pagination, reference: $reference) {\n    totalCount\n    page\n    limit\n    offset\n    cursor\n    nextCursor\n    hasNextPage\n    hasPreviousPage\n    items {\n      ...LedgerTransactionFields\n    }\n  }\n}\n\nquery LedgerTransaction($id: String!) {\n  ledgerTransaction(id: $id) {\n    ...LedgerTransactionFields\n  }\n}\n\nmutation RecordLedgerTransaction($input: RecordLedgerTransactionInput!) {\n  recordLedgerTransaction(input: $input) {\n    ...LedgerTransactionFields\n  }\n}": types.LedgerTransactionsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Accounts {\n  accounts {\n    ...AccountFields\n  }\n}\n\nquery Account($id: String!) {\n  account(id: $id) {\n    ...AccountFields\n  }\n}\n\nmutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    ...AccountFields\n  }\n}\n\nmutation UpdateAccount($id: String!, $input: UpdateAccountInput!) {\n  updateAccount(id: $id, input: $input) {\n    ...AccountFields\n  }\n}\n\nmutation DeleteAccount($id: String!) {\n  deleteAccount(id: $id) {\n    ...AccountFields\n  }\n}"): (typeof documents)["query Accounts {\n  accounts {\n    ...AccountFields\n  }\n}\n\nquery Account($id: String!) {\n  account(id: $id) {\n    ...AccountFields\n  }\n}\n\nmutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    ...AccountFields\n  }\n}\n\nmutation UpdateAccount($id: String!, $input: UpdateAccountInput!) {\n  updateAccount(id: $id, input: $input) {\n    ...AccountFields\n  }\n}\n\nmutation DeleteAccount($id: String!) {\n  deleteAccount(id: $id) {\n    ...AccountFields\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment AccountFields on AccountModel {\n  id\n  name\n  type\n  currency\n  isActive\n  balanceMinor\n  ledgerEntryCount\n  createdAt\n  updatedAt\n}\n\nfragment LedgerAccountFields on LedgerAccountModel {\n  id\n  name\n  type\n  currency\n  isActive\n}\n\nfragment LedgerEntryFields on LedgerEntryModel {\n  id\n  entryType\n  amountMinor\n  createdAt\n  account {\n    ...LedgerAccountFields\n  }\n}\n\nfragment LedgerTransactionFields on LedgerTransactionModel {\n  id\n  reference\n  description\n  transactionDate\n  createdAt\n  updatedAt\n  entries {\n    ...LedgerEntryFields\n  }\n}"): (typeof documents)["fragment AccountFields on AccountModel {\n  id\n  name\n  type\n  currency\n  isActive\n  balanceMinor\n  ledgerEntryCount\n  createdAt\n  updatedAt\n}\n\nfragment LedgerAccountFields on LedgerAccountModel {\n  id\n  name\n  type\n  currency\n  isActive\n}\n\nfragment LedgerEntryFields on LedgerEntryModel {\n  id\n  entryType\n  amountMinor\n  createdAt\n  account {\n    ...LedgerAccountFields\n  }\n}\n\nfragment LedgerTransactionFields on LedgerTransactionModel {\n  id\n  reference\n  description\n  transactionDate\n  createdAt\n  updatedAt\n  entries {\n    ...LedgerEntryFields\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query LedgerTransactions($pagination: PaginationInput, $reference: String) {\n  ledgerTransactions(pagination: $pagination, reference: $reference) {\n    totalCount\n    page\n    limit\n    offset\n    cursor\n    nextCursor\n    hasNextPage\n    hasPreviousPage\n    items {\n      ...LedgerTransactionFields\n    }\n  }\n}\n\nquery LedgerTransaction($id: String!) {\n  ledgerTransaction(id: $id) {\n    ...LedgerTransactionFields\n  }\n}\n\nmutation RecordLedgerTransaction($input: RecordLedgerTransactionInput!) {\n  recordLedgerTransaction(input: $input) {\n    ...LedgerTransactionFields\n  }\n}"): (typeof documents)["query LedgerTransactions($pagination: PaginationInput, $reference: String) {\n  ledgerTransactions(pagination: $pagination, reference: $reference) {\n    totalCount\n    page\n    limit\n    offset\n    cursor\n    nextCursor\n    hasNextPage\n    hasPreviousPage\n    items {\n      ...LedgerTransactionFields\n    }\n  }\n}\n\nquery LedgerTransaction($id: String!) {\n  ledgerTransaction(id: $id) {\n    ...LedgerTransactionFields\n  }\n}\n\nmutation RecordLedgerTransaction($input: RecordLedgerTransactionInput!) {\n  recordLedgerTransaction(input: $input) {\n    ...LedgerTransactionFields\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;