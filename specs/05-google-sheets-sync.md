# Google Sheets Sync

## Architecture

Firebase Cloud Functions (Node 20, TypeScript) handle all Sheets API interactions. Credentials never leave the server.

## Triggers

### 1. `onListCreate` — `onCreate` trigger on `lists/{listId}`

Fires when a new list document is created.

**Steps:**
1. Parse `SERVICE_ACCOUNT_JSON` from environment
2. Authenticate with Google Sheets API using service account
3. Call `sheets.spreadsheets.create` with title = list title
4. Write header row to Sheet1!A1:
   ```
   Item | Category | Qty | Qty Purchased | Reserved By | Purchased By | Priority | Notes | Added By | Date Added
   ```
5. Write `spreadsheetId` back to `lists/{listId}.googleSheetId`

### 2. `onItemWrite` — `onDocumentWritten` trigger on `lists/{listId}/items/{itemId}`

Fires on any create, update, or delete of an item.

**Steps:**
1. Fetch parent list document → get `googleSheetId`
2. If `googleSheetId` is null, skip (sheet not ready yet)
3. Fetch all items from `lists/{listId}/items`
4. Call `values.clear` on range `Sheet1!A2:Z`
5. Call `values.update` with all item rows starting at `Sheet1!A2`

**Row format:**
```
[name, category, quantity, quantityPurchased, reservedBy ?? '', purchasedBy ?? '', priority, notes, addedBy, createdAt.toDate().toLocaleDateString('es-MX')]
```

## Full-Rewrite Strategy

Instead of incremental updates (complex, error-prone), we do a full rewrite on every change:
- Clear all data rows
- Write all current items

This is correct because:
- Expected item count < 100 (baby shower list)
- Sheets API quota: 300 write requests/minute — well within limits
- Simplicity beats premature optimization

## Service Account Setup

1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Create service account (e.g., `babylist-sheets-sync`)
3. Download JSON key file
4. Set `SERVICE_ACCOUNT_JSON` env var in `functions/.env` (stringified JSON)
5. For each created Sheet, the service account is set as owner automatically (it creates the sheet)

## Error Handling

- If Sheets API fails, log error but don't fail the Firestore write
- Function retries are disabled (idempotent full-rewrite strategy handles retries safely)
- If `googleSheetId` is missing on list, skip sync gracefully

## Column Mapping

| Column | Field | Notes |
|---|---|---|
| A | Item | item.name |
| B | Category | item.category |
| C | Qty | item.quantity |
| D | Qty Purchased | item.quantityPurchased |
| E | Reserved By | item.reservedBy or '' |
| F | Purchased By | item.purchasedBy or '' |
| G | Priority | item.priority |
| H | Notes | item.notes |
| I | Added By | item.addedBy |
| J | Date Added | item.createdAt formatted |
