# Data Model

## Firestore Collections

### `lists/{listId}`

| Field | Type | Notes |
|---|---|---|
| title | string | e.g. "Baby Shower de María" |
| ownerName | string | Name of the person who created the list |
| babyName | string | Baby's name (can be "Baby X" if unknown) |
| dueDate | string | ISO date string (YYYY-MM-DD) |
| shareCode | string | nanoid(6), used in `/list/:shareCode` |
| adminCode | string | nanoid(12), used in `/manage/:adminCode` |
| googleSheetId | string \| null | Spreadsheet ID from Sheets API; null until created |
| createdAt | Timestamp | Server timestamp |
| updatedAt | Timestamp | Server timestamp |

### `lists/{listId}/items/{itemId}`

| Field | Type | Notes |
|---|---|---|
| name | string | Item display name |
| category | string | One of: Ropa / Mobiliario / Higiene / Juguetes / Alimentación / Otros |
| quantity | number | How many are needed |
| quantityPurchased | number | How many have been purchased |
| priority | 'high' \| 'medium' \| 'low' | Visual indicator for family |
| reservedBy | string \| null | Name of person who reserved; null if not reserved |
| purchasedBy | string \| null | Name of person who purchased; null if not purchased |
| isPurchased | boolean | True when the item is fully purchased |
| isReserved | boolean | True when reservedBy is set |
| imageUrl | string \| null | Optional product image URL |
| notes | string | Free text notes (brand preferences, size, etc.) |
| addedBy | string | Owner name or family member name (for suggestions) |
| createdAt | Timestamp | Server timestamp |

## Categories
```ts
const CATEGORIES = [
  'Ropa',
  'Mobiliario',
  'Higiene',
  'Juguetes',
  'Alimentación',
  'Otros',
] as const;
```

## Priorities
```ts
const PRIORITIES = ['high', 'medium', 'low'] as const;
```

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read lists and items (via shareCode lookup)
    match /lists/{listId} {
      allow read: if true;
      // Create only via admin SDK (Cloud Functions)
      allow create: if false;
      // Update only via admin SDK
      allow update: if false;
      allow delete: if false;
    }

    match /lists/{listId}/items/{itemId} {
      allow read: if true;
      // Family can only update reservation/purchase fields
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['isReserved', 'reservedBy', 'isPurchased', 'purchasedBy', 'quantityPurchased']);
      // Create and delete only via admin SDK
      allow create: if false;
      allow delete: if false;
    }
  }
}
```

## Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "lists",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shareCode", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "lists",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "adminCode", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```
