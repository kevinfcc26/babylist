# Spec 06 — Google Apps Script Backend (Google Sheets as Database)

## Architecture

```
Browser (React SPA)
  └── fetch() GET → Google Apps Script Web App
                      └── SpreadsheetApp API
                            ├── Registry Spreadsheet
                            └── Per-list Spreadsheets
```

Firebase is not used. No Cloud Functions, no Firestore, no service account JSON.

---

## Why GET-only requests

GAS Web Apps have a redirect bug: when a `POST` request arrives, GAS issues a 302 redirect for internal auth. The browser follows the redirect but changes `POST → GET` per the HTTP spec, so `doPost` is never called and GAS returns 405.

**Solution**: send all requests as `GET`. Data that would go in the POST body is encoded as:
- `action` — plain query param
- `payload` — single JSON-encoded query param containing everything else

```
GET https://script.google.com/macros/s/ID/exec
  ?action=createList
  &payload={"title":"Baby Shower","ownerName":"María",...}
```

No CORS preflight (GET is always a simple request). No redirect issues.

---

## GAS Entry Point

```js
// gas/Code.gs
function doGet(e) {
  const action  = e.parameter.action;
  const payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : {};
  return handleRequest({ action, ...payload });
}
```

`doPost` is kept as a fallback but is not called by the frontend.

---

## Registry Spreadsheet

One spreadsheet tracks all lists. Created once by running `setup()` manually in the GAS editor. Its ID is stored in Script Properties as `REGISTRY_SHEET_ID`.

Sheet `lists` columns: `listId | shareCode | adminCode | spreadsheetId | title | createdAt`

---

## API Actions

All actions are routed through `handleRequest(params)` in `Code.gs`.

| Action | Auth | Description |
|---|---|---|
| `getList` | shareCode or adminCode | Returns list metadata + all items |
| `createList` | none | Creates spreadsheet + registry entry, returns codes |
| `addItem` | adminCode | Appends row to items sheet |
| `updateItem` | adminCode | Overwrites item row in place |
| `deleteItem` | adminCode | Deletes item row |
| `reserveItem` | shareCode | Sets isReserved=TRUE with LockService |
| `cancelReservation` | shareCode | Clears reservation (only if reservedBy matches) |
| `markPurchased` | shareCode | Sets isPurchased=TRUE with LockService |
| `suggestItem` | shareCode | Appends item row with priority=low |

---

## Concurrency

`reserveItem`, `cancelReservation`, `markPurchased` use `LockService.getScriptLock()` with a 5-second wait. This serializes concurrent writes from multiple family members so the same item can't be double-reserved.

---

## Real-Time Strategy: Polling

GAS has no push/WebSocket capability. The frontend polls:

- Every **10 seconds** while the tab is visible (`document.visibilityState === 'visible'`)
- Immediately on tab **focus** (visibilitychange event)
- Polling pauses when the tab is hidden

Implemented in `src/hooks/useList.ts` and `src/hooks/useAdminList.ts` using `setInterval` + `useEffect`. Both hooks return `{ list, items, loading, error, refresh }` — items are bundled in the single `getList` response.

---

## GAS Deployment Steps

1. Go to [script.google.com](https://script.google.com) → New project
2. Paste `gas/Code.gs`
3. Run `setup()` once from the editor — creates the registry spreadsheet
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL → set as `VITE_GAS_URL` in `.env` (local) and as a GitHub Actions variable (CI)
6. After any code changes: **Deploy → Manage deployments → Edit → New version → Deploy**

---

## GAS Quotas (free tier)

| Quota | Limit | Expected usage |
|---|---|---|
| Script runtime | 6 min/execution | Each request: < 3s |
| Total runtime/day | 90 min | < 1 min/day for a family |
| Spreadsheet reads/writes | 300/min | Well within limits |
| URL fetch | 20,000/day | Not used |

---

## Limitations vs Firestore version

| Limitation | Impact |
|---|---|
| Polling (10s) instead of real-time push | Minor — family rarely reserves simultaneously |
| GAS cold start ~1-3s after inactivity | Slow first request; subsequent are fast |
| No offline support | Acceptable for a one-time event |
| URL length limit for payload (~2000 chars) | Not a concern — all inputs are short strings |
