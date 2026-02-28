# Components Specification

## Component Tree

```
App (createBrowserRouter, basename = import.meta.env.BASE_URL)
├── / → HomePage
│   ├── AppShell
│   │   └── PageHeader
│   ├── CreateListForm        — calls createList() → redirects to /manage/:adminCode
│   └── EnterCodeForm         — detects code length (6=share, 12=admin) → redirects
│
├── /list/:shareCode → SharedListPage
│   ├── AppShell / PageHeader
│   ├── ListProgressBar
│   ├── CategoryFilter
│   ├── ItemGrid
│   │   └── ItemCard (×n)
│   │       └── ReserveModal
│   └── SuggestItemForm       — calls suggestItem(listId, shareCode, ...)
│
├── /manage/:adminCode → AdminPage
│   ├── AppShell / PageHeader
│   ├── ShareLinkPanel        — URL uses import.meta.env.BASE_URL
│   ├── AdminLinkPanel        — URL uses import.meta.env.BASE_URL
│   ├── SheetsSyncStatus      — links to Google Sheet
│   ├── ListProgressBar
│   ├── ItemForm              — calls addItem / updateItem with adminCode
│   ├── CategoryFilter
│   ├── ItemTable             — responsive (table on desktop, cards on mobile)
│   └── DeleteConfirmModal
│
└── * → NotFoundPage
```

---

## Data flow

- `useList(shareCode)` and `useAdminList(adminCode)` both return `{ list, items, loading, error, refresh }`.
- Items are bundled in the same GAS `getList` response — no separate items fetch.
- After any mutation (reserve, purchase, add, delete), `refresh()` is called to re-fetch.
- Polling runs every 10 seconds while the tab is visible.

---

## Shared Components (`src/components/shared/`)

### Button
```ts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  className?: string
}
```

### Input
```ts
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}
```

### Modal
```ts
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}
```
Locks body scroll while open. Closes on backdrop click.

### Badge
```ts
interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pink'
  children: ReactNode
}
```

### Spinner, EmptyState, ErrorBoundary
Standard loading / empty / error display components.

---

## Layout Components (`src/components/layout/`)

### AppShell
Full-page container with pink→purple gradient, max-w-5xl, centered.

### PageHeader
```ts
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode   // right-aligned slot (e.g. "+ Add item" button)
}
```

---

## Home Components (`src/components/home/`)

### CreateListForm
Fields: title, ownerName, babyName, dueDate. All required. On submit calls `createList()` and redirects to `/manage/:adminCode`.

### EnterCodeForm
Single input. 6-char → redirect to `/list/:code`. 12-char → redirect to `/manage/:code`.

---

## List Components (`src/components/list/`)

### ItemCard
```ts
interface ItemCardProps {
  listId: string
  shareCode: string     // passed to all item service calls
  item: ListItem
  onMutate: () => void  // triggers refresh after reserve/purchase
}
```

### ItemGrid
```ts
interface ItemGridProps {
  listId: string
  shareCode: string
  items: ListItem[]
  onMutate: () => void
}
```
Responsive grid: 1 col mobile / 2 col tablet / 3 col desktop.

### ReserveModal
Asks for the reserver's name. Calls `reserveItem(listId, itemId, name, shareCode)`.

### SuggestItemForm
```ts
interface SuggestItemFormProps {
  listId: string
  shareCode: string
  onSuccess: () => void
  onCancel: () => void
}
```

### CategoryFilter
Pill buttons for each category + "Todos". Shows item count per category.

### PriorityBadge
high → red "Alta" / medium → yellow "Media" / low → gray "Baja"

### ListProgressBar
Shows purchased / reserved / available breakdown with a color-coded bar.

---

## Admin Components (`src/components/admin/`)

### ItemForm
```ts
interface ItemFormProps {
  listId: string
  adminCode: string     // required for addItem / updateItem
  item?: ListItem       // if provided → edit mode
  onSuccess: () => void
  onCancel: () => void
}
```

### ItemTable
Desktop: HTML table. Mobile: card list. Edit and Delete buttons per row.

### ShareLinkPanel
Builds URL as `window.location.origin + import.meta.env.BASE_URL + "list/" + shareCode`. Copy-to-clipboard button.

### AdminLinkPanel
Same pattern but for the admin route. Warns user to keep it private.

### SheetsSyncStatus
Shows a link to the Google Sheet (`googleSheetId` from the list). Shows a spinner if `googleSheetId` is null (GAS hasn't finished setup yet).

### DeleteConfirmModal
Confirms before calling `deleteItem(listId, itemId, adminCode)`. Warns if item is reserved.
