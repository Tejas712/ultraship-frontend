TESTING.md

Manual Testing Guide

The database seed creates the required chart of accounts. The following scenarios can be used to verify the main accounting workflows implemented in this project.

⸻

Prerequisites

Run the database seed before testing.

The following accounts will be available:

* Operating Bank Account
* Cash Account
* Accounts Payable
* Accrued Expenses
* Owner Equity
* Freight Revenue
* Freight Expense
* Fuel Expense

⸻

Test Data

Create an invoice using the following values.

Field	Value
Invoice Number	INV-1001
Vendor	ABC Transport
Expense Account	Freight Expense
Payable Account	Accounts Payable
Line Item Description	Freight Charge
Amount	1000.00

⸻

Scenario 1 – Create & Send Invoice

1. Navigate to Invoices.
2. Click Create Invoice.
3. Create the invoice using the test data above.
4. Verify the invoice status is DRAFT.
5. Open the Invoice Details page.
6. Click Send Invoice.

Expected Result

* Invoice status changes to SENT.
* A new ledger transaction is created.

Ledger Entries:

Account	Entry
Freight Expense	Debit 1000.00
Accounts Payable	Credit 1000.00

⸻

Scenario 2 – Partial Payment

1. Open the invoice.
2. Click Simulate Payment.
3. Enter:

Field	Value
Amount	400.00
Payment Account	Operating Bank Account

Expected Result

Invoice

* Status: SENT
* Paid: 400.00
* Remaining: 600.00

Ledger Entries:

Account	Entry
Accounts Payable	Debit 400.00
Operating Bank Account	Credit 400.00

⸻

Scenario 3 – Final Payment

Apply another payment.

Field	Value
Amount	600.00
Payment Account	Operating Bank Account

Expected Result

Invoice

* Status becomes PAID
* Paid: 1000.00
* Remaining: 0.00

Ledger Entries:

Account	Entry
Accounts Payable	Debit 600.00
Operating Bank Account	Credit 600.00

⸻

Scenario 4 – Prevent Overpayment

Attempt another payment.

Field	Value
Amount	100.00

Expected Result

* Request is rejected.
* No payment is created.
* No ledger transaction is created.
* Invoice totals remain unchanged.

⸻

Scenario 5 – Refund Payment

1. Open the completed payment.
2. Click Refund.
3. Refund:

Field	Value
Amount	200.00

Expected Result

Invoice

* Status changes back to SENT
* Paid: 1000.00
* Refunded: 200.00
* Net Paid: 800.00
* Remaining: 200.00

Ledger Entries:

Account	Entry
Operating Bank Account	Debit 200.00
Accounts Payable	Credit 200.00

⸻

Scenario 6 – Prevent Excess Refund

Attempt to refund more than the remaining refundable amount.

Expected Result

* Request is rejected.
* No refund is created.
* No ledger transaction is created.

⸻

Scenario 7 – Concurrent Payments

1. Create another invoice for 1000.00.
2. Send the invoice.
3. Open the same invoice in two browser tabs.
4. Submit two payments almost simultaneously:

Tab 1

* Amount: 700.00

Tab 2

* Amount: 500.00

Expected Result

* One request succeeds.
* The second request waits for the row lock.
* The second request is rejected because the remaining balance is insufficient.
* The invoice is never overpaid.

⸻

Expected Final Account Balances

After completing the first invoice workflow (including the refund):

Account	Expected Balance
Freight Expense	1000.00
Accounts Payable	200.00
Operating Bank Account	-800.00
Cash Account	0.00
Fuel Expense	0.00
Freight Revenue	0.00
Owner Equity	0.00
Accrued Expenses	0.00

⸻

Notes

* All monetary values are stored internally as BigInt in minor currency units.
* Every financial operation creates a balanced double-entry ledger transaction.
* Payments and refunds are immutable financial events.
* Duplicate payment and refund requests are handled using idempotency keys.
* Concurrent payment requests are protected using PostgreSQL row-level locking (SELECT ... FOR UPDATE).