-- Drop mistaken 1:1 unique on Session.invoiceItemId; many sessions belong to one InvoiceItem.
DROP INDEX IF EXISTS "Session_invoiceItemId_key";

CREATE INDEX "Session_invoiceItemId_idx" ON "Session"("invoiceItemId");
