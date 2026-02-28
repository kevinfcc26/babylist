# Data Model

Data lives entirely in **Google Sheets**. There is no Firestore or any other database.

---

## Spreadsheet Layout

### Registry Spreadsheet (one, created by `setup()`)

Sheet name: `lists`

| Column | Field | Description |
|---|---|---|
| A | listId | UUID from `Utilities.getUuid()` |
| B | shareCode | 6-char alphanumeric (family access) |
| C | adminCode | 12-char alphanumeric (owner access) |
| D | spreadsheetId | Google Sheets file ID for this list |
| E | title | List title |
| F | createdAt | ISO date string |

Used by GAS to look up the correct spreadsheet from a shareCode or adminCode.

---

### List Spreadsheet (one per baby shower list)

Each list gets its own Google Spreadsheet with two sheets inside.

#### Sheet: `meta`

Row 1 = headers. Row 2 = data (only one data row).

| Column | Field | Type |
|---|---|---|
| A | title | string |
| B | ownerName | string |
| C | babyName | string |
| D | dueDate | string (YYYY-MM-DD) |
| E | shareCode | string |
| F | adminCode | string |
| G | createdAt | ISO date string |

#### Sheet: `items`

Row 1 = headers. One row per item from row 2 onward.

| Column | Field | Type | Notes |
|---|---|---|---|
| A | itemId | string | 10-char alphanumeric, generated in GAS |
| B | name | string | |
| C | category | string | Ropa / Mobiliario / Higiene / Juguetes / Alimentación / Otros |
| D | quantity | number | |
| E | quantityPurchased | number | |
| F | priority | string | high / medium / low |
| G | isReserved | boolean | TRUE / FALSE |
| H | reservedBy | string | name of person who reserved, or empty |
| I | isPurchased | boolean | TRUE / FALSE |
| J | purchasedBy | string | name of person who purchased, or empty |
| K | imageUrl | string | URL or empty |
| L | notes | string | free text |
| M | addedBy | string | owner or family member name |
| N | createdAt | string | ISO date string |

---

## ID Generation

All IDs are generated server-side in GAS:

```js
// listId
const listId = Utilities.getUuid();  // full UUID

// shareCode (6 chars)
const shareCode = generateCode(6);   // random from [a-z0-9]

// adminCode (12 chars)
const adminCode = generateCode(12);  // random from [a-z0-9]

// itemId (10 chars)
const itemId = generateCode(10);     // random from [a-z0-9]
```

---

## Categories

```
Ropa | Mobiliario | Higiene | Juguetes | Alimentación | Otros
```

## Priorities

```
high | medium | low
```

---

## Concurrency

`reserveItem`, `cancelReservation`, and `markPurchased` use `LockService.getScriptLock()` with a 5-second timeout to serialize concurrent writes and prevent double-reservation.
