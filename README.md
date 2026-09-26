# StockSense

An inventory operating system, not a CRUD demo: every stock number is backed by a ledger entry, every movement is traceable, and inventory is shown as tied-up business value, not just a quantity.

Built for the Odoo StockSense hackathon problem statement — digitizing receipts, delivery orders, internal transfers, and inventory adjustments for a multi-warehouse business.

## Core ideas

- **The stock ledger is the source of truth.** Every receipt, delivery, transfer, and adjustment writes to `stock_ledger` through a single Postgres function (`apply_stock_movement`) that locks the balance row, rejects anything that would go negative, and posts the ledger entry in the same transaction. `stock_balances` is a cache derived entirely from the ledger — it can never drift out of sync with it.
- **Every operation validates atomically.** `validate_receipt`, `validate_delivery`, `validate_transfer`, and `validate_adjustment` are Postgres functions that apply every line of a document and flip its status in one transaction. A document can't be double-validated, and an over-delivery or over-transfer rolls back the whole call — nothing partially posts.
- **Inventory has a health, not just a quantity.** Every product is Healthy, Low, Critical, Out of Stock, or Dead Stock, computed from its reorder level and days since last movement — the same logic drives the dashboard, the product catalog, and the product detail page.

## Stack

- Next.js (App Router) + TypeScript, server actions for all mutations
- Tailwind CSS, hand-built UI primitives (no component library dependency)
- Supabase (Postgres + Auth) — RLS-scoped to authenticated users, email OTP for password reset

## Feature map

| Area | What it covers |
|---|---|
| Auth | Sign up, sign in, OTP-based password reset, profile |
| Dashboard | Inventory value, unit count, stock health breakdown, attention list, recent activity, fast actions |
| Products | Catalog with SKU/category search, optional initial stock on creation, per-location stock, inventory value, movement history |
| Categories, Warehouses, Locations | Master data management |
| Receipts | Vendor → destination location, line items, draft → done, stock increases on validate |
| Delivery Orders | Source location → customer, stock decreases on validate, over-delivery rejected with a clear error |
| Internal Transfers | Location → location, posts as a linked pair (out + in), total inventory unchanged, same-location rejected |
| Inventory Adjustments | Physical count vs. system count, reviews the difference before validating |
| Move History | Global, filterable log of every stock movement |
| Search | Products by name/SKU, documents by reference |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database ships with a small industrial-hardware demo catalog (steel rods, bearings, pipes, sheet metal across two warehouses) but no stock or accounts — sign up and run receipts/transfers/deliveries/adjustments to populate it.

## Database

Schema lives in `supabase/migrations/`, applied in order. `supabase/seed.sql` has the demo product catalog.

## What's deliberately not here

No accounting, invoicing, procurement approvals, CRM, or manufacturing — those would turn this into an ERP instead of a focused inventory system. Reorder rules are rule-based (current stock vs. reorder level), not a forecasting model.
