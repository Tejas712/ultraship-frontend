import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { CreditCard, Pencil, RotateCcw, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { InvoiceFieldsFragment, PaymentFieldsFragment } from '@/__generated__/graphql';
import {
  AccountsDocument,
  InvoicesDocument,
  LedgerTransactionsDocument,
  SendInvoiceDocument,
} from '@/__generated__/graphql';
import { ApplyPaymentDialog } from '@/components/invoices/ApplyPaymentDialog';
import { CreateRefundDialog } from '@/components/invoices/CreateRefundDialog';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { AccountTypeBadge } from '@/components/shared/AccountTypeBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getGraphQLErrorMessage } from '@/utils/graphql-errors';
import { invoiceEditPath } from '@/core/routes/paths';

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight">
          <MoneyDisplay minor={value} />
        </p>
      </CardContent>
    </Card>
  );
}

export function InvoiceDetail({
  invoice,
  onUpdated,
}: {
  invoice: InvoiceFieldsFragment;
  onUpdated?: () => void | Promise<void>;
}) {
  const client = useApolloClient();
  const [sendInvoice, { loading: sending }] = useMutation(SendInvoiceDocument);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState<PaymentFieldsFragment | null>(
    null,
  );

  const canApplyPayment =
    invoice.status !== 'DRAFT' &&
    invoice.status !== 'PAID' &&
    BigInt(invoice.remainingMinor) > 0n;

  const hasRefundablePayment = useMemo(
    () =>
      invoice.payments.some(
        (payment) =>
          payment.status === 'COMPLETED' && BigInt(payment.refundableAmount) > 0n,
      ),
    [invoice.payments],
  );

  const dueDateLabel = new Date(invoice.dueDate).toLocaleDateString('en-CA');

  const handleSend = async () => {
    try {
      await sendInvoice({ variables: { id: invoice.id } });
      await client.refetchQueries({
        include: [
          InvoicesDocument,
          LedgerTransactionsDocument,
          AccountsDocument,
        ],
      });
      await onUpdated?.();
      toast.success('Invoice sent');
    } catch (sendError) {
      toast.error(getGraphQLErrorMessage(sendError, 'Unable to send invoice.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {invoice.vendorName} • due {dueDateLabel}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {invoice.status === 'DRAFT' ? (
            <>
              <Button
                type="button"
                variant="outline"
                render={<Link to={invoiceEditPath(invoice.id)} />}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button
                type="button"
                onClick={() => void handleSend()}
                disabled={sending}
              >
                <Send className="size-4" />
                {sending ? 'Sending…' : 'Send invoice'}
              </Button>
            </>
          ) : null}
          {canApplyPayment ? (
            <Button type="button" onClick={() => setPaymentDialogOpen(true)}>
              <CreditCard className="size-4" />
              Apply payment
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total" value={invoice.totalMinor} />
        <SummaryCard label="Net paid" value={invoice.netPaidMinor} />
        <SummaryCard label="Refunded" value={invoice.refundedMinor} />
        <SummaryCard label="Balance due" value={invoice.remainingMinor} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Line items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay minor={item.amountMinor} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Payments & refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoice.payments.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-muted-foreground">
                  No payments yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Refunded</TableHead>
                      <TableHead className="text-right">Refundable</TableHead>
                      <TableHead className="w-24" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.flatMap((payment) => {
                      const rows = [
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-sm">
                            {payment.externalPaymentId}
                          </TableCell>
                          <TableCell>{payment.paymentAccount.name}</TableCell>
                          <TableCell className="text-right">
                            <MoneyDisplay minor={payment.amountMinor} />
                          </TableCell>
                          <TableCell className="text-right">
                            <MoneyDisplay minor={payment.refundedMinor} />
                          </TableCell>
                          <TableCell className="text-right">
                            <MoneyDisplay minor={payment.refundableAmount} />
                          </TableCell>
                          <TableCell className="text-right">
                            {payment.status === 'COMPLETED' &&
                            BigInt(payment.refundableAmount) > 0n ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setRefundPayment(payment)}
                              >
                                <RotateCcw className="size-3.5" />
                                Refund
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>,
                      ];

                      payment.refunds.forEach((refund) => {
                        rows.push(
                          <TableRow key={refund.id} className="bg-muted/20">
                            <TableCell className="pl-8 font-mono text-sm text-muted-foreground">
                              ↳ {refund.externalRefundId}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              Refund
                            </TableCell>
                            <TableCell className="text-right text-destructive">
                              −<MoneyDisplay minor={refund.amountMinor} />
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                          </TableRow>,
                        );
                      });

                      return rows;
                    })}
                  </TableBody>
                </Table>
              )}
              {hasRefundablePayment ? (
                <p className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
                  Use Refund on a payment row to return funds to the customer and
                  restore the payable balance.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-20">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Expense</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{invoice.expenseAccount.name}</p>
                <AccountTypeBadge type={invoice.expenseAccount.type} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Payable</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{invoice.payableAccount.name}</p>
                <AccountTypeBadge type={invoice.payableAccount.type} />
              </div>
            </div>
            {invoice.status === 'DRAFT' ? (
              <p className="border-t border-border pt-4 text-sm text-muted-foreground">
                Send the invoice to post the expense and payable to the ledger.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {canApplyPayment ? (
        <ApplyPaymentDialog
          invoice={invoice}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onSuccess={onUpdated}
        />
      ) : null}

      {refundPayment ? (
        <CreateRefundDialog
          payment={refundPayment}
          open={Boolean(refundPayment)}
          onOpenChange={(open) => {
            if (!open) setRefundPayment(null);
          }}
          onSuccess={onUpdated}
        />
      ) : null}
    </div>
  );
}
