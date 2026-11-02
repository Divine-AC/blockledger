# BlockLedger

BlockLedger is an offline-first yard operations and bookkeeping system for concrete block producers and building-material sellers. It connects production, stock, sales, deliveries, customer collections, material use, supplier bills and operating expenses. Sales and payments are recorded in the system; customer receipts can continue to be written on paper.

## Run the app

From this folder:

```bash
npm install
npm run dev
```

Open `http://localhost:5050`. The development and production start scripts use port 5050 so they do not conflict with another service on port 3000. The app stores records in the browser's IndexedDB database using Dexie. Once the page has loaded, entries can be created without an internet connection. Data is kept in that browser profile on that device; clearing browser data or switching devices will not move the ledger. Use **Export backup** regularly to save a CSV backup.

## Yard workflows

- **Production and block stock:** log each block type, batch quantity, rejects and notes. Stock on hand is opening count plus good production and adjustments, less block sales. Sales cannot exceed recorded stock.
- **Block and cement sales:** create an invoice with unit price, optional delivery charge and initial payment. Cement bags reduce cement stock.
- **Paper receipts:** the system keeps sale and payment records without generating customer receipts.
- **Deliveries:** link dispatches to sales, assign a driver and vehicle, schedule a date, and append status updates through delivery.
- **Customer accounts:** group invoices by customer and allocate later collections to a specific invoice.
- **Materials and suppliers:** receive cement, sand, granite and other materials into stock, record credit terms, issue stock to production and track supplier balances and payments.
- **Expenses:** track labour, fuel, repairs, transport, rent and other operating costs.
- **Accounting and reports:** review revenue, customer receivables, supplier payables, cash movement, a derived journal, trial balance, material usage and an indicative operating result. Export the complete ledger to CSV.

The accounting view is an operational estimate, not audited financial statements. It builds journal lines and a trial balance from the yard records, uses weighted average receipt cost when materials are issued, and expenses logged by staff. It does not yet support opening cash/bank balances, payroll, tax, depreciation, bank reconciliation, purchase returns, or accountant-reviewed closing procedures. Enter opening block counts through **Set or correct stock**. Enter opening material quantities and values using the **Opening stock** option on a material receipt; this does not create a supplier bill or cash movement. Use consistent customer and supplier names.

## Imported tracker history

The supplied `Block_Industry_Tracker_Improved 1.pdf` contains 182 historical rows dated 1 June–3 August 2026. On first load, the app imports those rows into **Orders & sales → Old tracker history**. Overview includes a link to the archive. The searchable archive preserves the source's production, sales, supply notes, cost categories, profit, payments and debt; missing values stay blank. Imported history remains separate from current stock, invoices and balances so old figures do not silently change today's books. The CSV backup includes both current records and all imported source columns.

The source totals do not fully reconcile: recorded revenue is ₦22,467,800, recorded costs are ₦26,964,202, recorded profit values total ₦2,882,558, and recorded paid values total ₦26,941,590. These are displayed as entered and should be checked against paper books before they are used to settle accounts. A reliable operating result requires costs to be matched to the production and sales they belong to, so the app labels its live result as estimated.

The app keeps production batches separate from customer sales so a batch is counted once even when several customers buy that day. Record cement, sand and other stock as materials; record labour, fuel, transport and other running costs as expenses.

## Cloud sync status

The repository includes a Supabase client, a sync module and a schema extended for these records, but cloud sign-in, secure business onboarding and a complete cross-device sync workflow are not wired into the app. The interface therefore labels the current version **Local mode** and does not suggest that records are backed up remotely. The included schema documents a starting point; secure onboarding and a reviewed sync workflow are required before shared business accounts can be enabled.

## Data and privacy

The app does not require an account and does not send local entries to a server. Anyone with access to the same unlocked browser profile can access its local ledger. Keep the device secure and export a backup to a location you control.
