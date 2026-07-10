import type { AccountType } from '@/__generated__/graphql';
import type { ApplyPaymentFormInput } from '@/types/apply-payment-form';
import type { CreateAccountFormInput } from '@/types/create-account-form';
import type { CreateRefundFormInput } from '@/types/create-refund-form';
import type { EditAccountFormInput } from '@/types/edit-account-form';
import type { RecordTransactionFormInput } from '@/types/record-transaction-form';

export const DEFAULT_APPLY_PAYMENT_FORM_VALUES: ApplyPaymentFormInput = {
  externalPaymentId: '',
  paymentAccountId: '',
  amountUsd: '',
};

export const DEFAULT_CREATE_REFUND_FORM_VALUES: CreateRefundFormInput = {
  externalRefundId: '',
  amountUsd: '',
};

export const DEFAULT_RECORD_TRANSACTION_FORM_VALUES: RecordTransactionFormInput = {
  reference: '',
  description: '',
  debitAccountId: '',
  creditAccountId: '',
  amountUsd: '',
};

export const DEFAULT_CREATE_ACCOUNT_FORM_VALUES: CreateAccountFormInput = {
  name: '',
  type: '' as AccountType | '',
};

export const DEFAULT_EDIT_ACCOUNT_FORM_VALUES: EditAccountFormInput = {
  name: '',
  type: '' as AccountType | '',
  isActive: true,
};
