# Spec 06 — Google Sheets as Sole Data Store

## Motivation

Replace Firebase Firestore with Google Sheets as the single source of truth.
No Firestore, no Firebase Cloud Functions. The sheet is the database.

---

## Architecture Overview

```
Browser (React SPA)
  └── fetch() → Google Apps Script Web App (acts as REST API)
                  └── SpreadsheetApp service → Google Sheet (database)
```

**Why Google Apps Script (GAS)?**

- Google Sheets cannot be read/written directly from a browser without exposing OAuth credentials.
- GAS Web Apps run server-side, have full access to any sheet the deploying user owns, and can be deployed as public HTTPS endpoints with no cost.
- Zero infrastructure: no Firebase Functions, no Node server, no hosting for the backend.
- The frontend only needs Firebase Hosting (or any static host) for the React SPA.

---

## Sheet Structure

One workbook per list. The workbook is created when a new list is created.

### Sheet 1 — `meta`

Stores the list's metadata. Row 2 is the only data row.

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| title | ownerName | babyName | dueDate | shareCode | adminCode | createdAt |

### Sheet 2 — `items`

One row per item.

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| itemId | name | category | quantity | quantityPurchased | priority | isReserved | reservedBy | isPurchased | purchasedBy | imageUrl | notes | addedBy | createdAt |

**itemId**: nanoid(10) generated server-side in GAS at insert time.

---

## Google Apps Script API

The GAS project is deployed as a **Web App**:
- Execute as: **Me** (the owner's Google account)
- Who has access: **Anyone** (no login required — security via secret codes)

### Base URL

```
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

Stored as `VITE_GAS_URL` in the frontend `.env`.

### Endpoints

All requests use query params for GET and JSON body for POST/PATCH/DELETE.
GAS Web Apps only support `GET` and `POST` natively; other verbs are tunneled via a `_method` body param.

#### `GET ?action=getList&shareCode=abc123`
Returns the list metadata + all items.
```json
{
  "ok": true,
  "list": { "title": "...", "ownerName": "...", "babyName": "...", "dueDate": "...", "shareCode": "...", "googleSheetId": "..." },
  "items": [ { "itemId": "...", "name": "...", ... } ]
}
```

#### `GET ?action=getList&adminCode=abc123def456`
Same as above but authenticated by adminCode. Returns `googleSheetId` too.

#### `POST action=createList`
Body:
```json
{ "title": "...", "ownerName": "...", "babyName": "...", "dueDate": "..." }
```
Response:
```json
{ "ok": true, "shareCode": "abc123", "adminCode": "abc123def456", "spreadsheetId": "..." }
```
- Generates `shareCode` (6 chars) and `adminCode` (12 chars) in GAS using `Utilities.getUuid()` trimmed.
- Creates a new Google Spreadsheet (or uses a master one with per-list sheets).
- Writes the `meta` row.

#### `POST action=addItem`
Body:
```json
{ "adminCode": "...", "name": "...", "category": "...", "quantity": 1, "priority": "medium", "imageUrl": null, "notes": "...", "addedBy": "..." }
```
Response:
```json
{ "ok": true, "itemId": "abc1234567" }
```

#### `POST action=updateItem`
Body:
```json
{ "adminCode": "...", "itemId": "...", "name": "...", "category": "...", ... }
```
Only the fields provided are updated (partial update via row rewrite).

#### `POST action=deleteItem`
Body:
```json
{ "adminCode": "...", "itemId": "..." }
```

#### `POST action=reserveItem`
Body:
```json
{ "shareCode": "...", "itemId": "...", "reservedBy": "..." }
```
- Checks that `isReserved !== TRUE` before writing (optimistic concurrency — GAS is single-threaded per execution, so race conditions are very unlikely for this use case).
- Sets `isReserved=TRUE`, `reservedBy=name`.

#### `POST action=cancelReservation`
Body:
```json
{ "shareCode": "...", "itemId": "...", "reservedBy": "..." }
```
Only cancels if `reservedBy` matches.

#### `POST action=markPurchased`
Body:
```json
{ "shareCode": "...", "itemId": "...", "purchasedBy": "..." }
```
Sets `isPurchased=TRUE`, `purchasedBy=name`, `isReserved=TRUE`, `reservedBy=name`, `quantityPurchased=quantity`.

#### `POST action=suggestItem`
Body:
```json
{ "shareCode": "...", "name": "...", "category": "...", "notes": "...", "addedBy": "..." }
```
Inserts item with `priority=low`, `quantity=1`.

---

## Concurrency & Consistency

GAS executions are isolated per HTTP request and single-threaded within a request. For a baby shower (< 20 concurrent users expected) this is acceptable. To guard against the rare double-reservation:

1. On `reserveItem`, read the row, check `isReserved`, then write — all within one GAS execution.
2. Use `LockService.getScriptLock()` for the reserve and purchase writes to serialize concurrent requests.

```js
// In GAS
const lock = LockService.getScriptLock();
lock.waitLock(5000); // wait up to 5s
try {
  // check + write
} finally {
  lock.releaseLock();
}
```

---

## Real-Time Updates

Google Sheets has no native WebSocket/push capability. Strategy: **polling**.

- The React frontend polls `getList` every **10 seconds** when the tab is visible (`document.visibilityState === 'visible'`).
- On tab blur, polling pauses. On tab focus, it immediately re-fetches then resumes.
- This is sufficient for a family baby shower where instant sync is not critical.

Implementation: a custom hook `useSheetList(shareCode)` using `setInterval` + `useEffect`.

---

## Frontend Changes vs Firestore Version

| Area | Firestore version | Sheets-only version |
|---|---|---|
| `src/firebase/config.ts` | Firebase init | **Removed** (or kept only for Hosting) |
| `src/services/lists.ts` | Firestore queries | `fetch(GAS_URL + params)` |
| `src/services/items.ts` | Firestore writes | `fetch(GAS_URL, { method:'POST', body })` |
| `src/hooks/useList.ts` | `onSnapshot` | `setInterval` polling |
| `src/hooks/useAdminList.ts` | `onSnapshot` | `setInterval` polling |
| `src/hooks/useItems.ts` | `onSnapshot` | Derived from `useList` (items come bundled) |
| `nanoid` (frontend) | generate codes | **Removed** (codes generated in GAS) |
| `firebase` npm package | required | **Optional** (only if keeping Hosting) |

---

## GAS Implementation Sketch

```javascript
// Code.gs

const MASTER_FOLDER_ID = '...'; // Google Drive folder for all lists

function doGet(e) {
  return handleRequest(e.parameter, null);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  return handleRequest(e.parameter, body);
}

function handleRequest(params, body) {
  const action = params.action || (body && body.action);
  try {
    switch (action) {
      case 'getList':      return json(getList(params));
      case 'createList':   return json(createList(body));
      case 'addItem':      return json(addItem(body));
      case 'updateItem':   return json(updateItem(body));
      case 'deleteItem':   return json(deleteItem(body));
      case 'reserveItem':  return json(reserveItem(body));
      case 'cancelReservation': return json(cancelReservation(body));
      case 'markPurchased': return json(markPurchased(body));
      case 'suggestItem':  return json(suggestItem(body));
      default:             return json({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json({ ok: false, error: err.message });
  }
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Security Notes

- `adminCode` gates all destructive operations (add/edit/delete item). Validated in GAS by reading the `meta` sheet.
- `shareCode` gates read + reserve + purchase operations.
- Both codes are nanoid-equivalent entropy (GAS uses `Utilities.getUuid()` sliced to length).
- The GAS Web App URL is public but actions require valid codes.
- **Do not log codes** in GAS execution logs (Cloud Logging is accessible to project viewers).

---

## Deployment Steps

1. Go to [script.google.com](https://script.google.com) → New Project.
2. Paste `Code.gs` implementation.
3. **Deploy** → **New deployment** → Type: **Web app**.
   - Execute as: Me
   - Access: Anyone
4. Copy the Web App URL → set `VITE_GAS_URL=https://script.google.com/macros/s/.../exec` in `.env`.
5. Every time `Code.gs` changes, create a **new deployment** (URL stays the same if you update the existing deployment version).

---

## Limitations vs Firestore version

| Limitation | Impact |
|---|---|
| Polling instead of real-time push | 10s lag for family members seeing each other's reservations |
| GAS cold start ~1–3s | First request after inactivity is slow |
| GAS quota: 6 min/execution, 90 min/day total (free) | Irrelevant at this scale |
| No offline support | Minor — family uses it once |
| Sheets API has 300 req/min quota | Fine for < 20 users |
| LockService max wait 10s | Very rare timeout possible under heavy concurrent writes |

---

## Files to Create / Modify

```
babylistapp/
├── gas/
│   └── Code.gs                 # GAS source (deploy manually to script.google.com)
├── src/
│   ├── services/
│   │   ├── gasClient.ts        # Base fetch wrapper for GAS API
│   │   ├── lists.ts            # REPLACED: createList, getByShareCode, getByAdminCode
│   │   └── items.ts            # REPLACED: addItem, updateItem, deleteItem, reserveItem, markPurchased
│   └── hooks/
│       ├── useList.ts          # REPLACED: polling hook
│       ├── useAdminList.ts     # REPLACED: polling hook
│       └── useItems.ts         # REPLACED: derived from useList (items bundled)
└── .env                        # ADD: VITE_GAS_URL=
```

All pages and UI components remain **unchanged**.
