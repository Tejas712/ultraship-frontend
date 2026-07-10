UltraShip Assignment

Overview

This project is a simplified accounting system built with NestJS, GraphQL, Prisma, PostgreSQL, and React.

The focus of the implementation was building a reliable financial workflow rather than just CRUD operations. It includes invoice management, double-entry ledger posting, payments, refunds, idempotent processing, and protection against concurrent payment requests.

⸻

Features

* Double-entry ledger
* Chart of Accounts
* Invoice management
* Invoice posting (Draft → Sent)
* Partial and full payments
* Payment refunds
* BigInt money handling using minor currency units
* Idempotent payment and refund processing
* Concurrent payment protection using PostgreSQL row-level locking
* GraphQL API
* React frontend

⸻

Tech Stack

Backend

* NestJS
* GraphQL
* Prisma
* PostgreSQL
* TypeScript

Frontend

* React
* Apollo Client
* TypeScript
* Tailwind CSS
* shadcn/ui

⸻

Running the Project

Backend

Install dependencies:

npm install

Run database migrations:

npx prisma migrate dev

Seed the database:

npm run seed

Start the backend:

npm run start:dev

⸻

Frontend

Install dependencies:

npm install

Generate GraphQL types:

npm run codegen

Start the frontend:

npm run dev

⸻

Seed Data

The project seeds a small chart of accounts used throughout the demo:

* Operating Bank Account
* Cash Account
* Accounts Payable
* Accrued Expenses
* Owner Equity
* Freight Revenue
* Freight Expense
* Fuel Expense

⸻

Business Flow

1. Create Invoice

Creates a draft invoice with one or more line items.

No ledger transaction is created.

2. Send Invoice

Posting an invoice records the following ledger transaction:

Debit

* Freight Expense

Credit

* Accounts Payable

3. Apply Payment

Applying a payment records:

Debit

* Accounts Payable

Credit

* Operating Bank Account

Supports:

* Partial payments
* Multiple payments
* Full payment

Invoice status is updated automatically based on the remaining balance.

4. Refund Payment

Refunds never modify an existing payment.

Instead, a new ledger transaction is created:

Debit

* Operating Bank Account

Credit

* Accounts Payable

This keeps the ledger balanced while preserving a complete audit history.

⸻

Design Decisions

A few implementation decisions that I felt were important for an accounting system:

* Monetary values are stored as BigInt in minor currency units to avoid floating-point precision issues.
* The ledger is immutable. Historical ledger transactions are never modified; payments and refunds always create new ledger transactions.
* Invoice totals, paid amounts, refunded amounts, remaining balances, and account balances are derived instead of stored to avoid synchronization issues.
* Payments and refunds are idempotent using external identifiers, preventing duplicate financial records.
* Invoice payments execute inside a Prisma transaction and use PostgreSQL SELECT ... FOR UPDATE row locking to prevent concurrent overpayments.

⸻

Things I Would Improve With More Time

* Add support for multi-currency accounting with configurable exchange rates.
* Integrate with a real payment provider instead of simulated payments.
* Add bank account integration and dynamic bank synchronization instead of using seeded payment accounts.
* Expand automated testing with unit, integration, and end-to-end tests.
* Add authentication, authorization, and role-based access control.
* Generate PDF invoices and maintain a complete audit trail.
* Build financial reports such as Trial Balance, Balance Sheet, and Profit & Loss.
* Improve dashboard analytics and transaction filtering.

⸻

Shortcuts I Took

To keep the scope manageable for the assignment:

* Payments and refunds are simulated instead of integrating with a real payment gateway.
* Authentication and user management are not implemented.
* A fixed chart of accounts is seeded for demonstration.
* The project assumes a single-company accounting model.
* No webhook processing or background jobs were implemented.

⸻

What I Focused On

Rather than implementing as many features as possible, I spent most of my time making the financial workflow reliable and consistent.

The areas I prioritized were:

* Correct double-entry accounting
* Immutable financial records
* Accurate money handling with BigInt
* Idempotent payment and refund processing
* Preventing concurrent overpayments
* Keeping financial data derived instead of duplicated

These decisions helped keep the accounting logic predictable while preserving a complete financial history.