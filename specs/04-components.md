# Components Specification

## Component Tree

```
App (Router)
├── / → HomePage
│   ├── AppShell
│   │   └── PageHeader
│   ├── CreateListForm
│   └── EnterCodeForm
├── /list/:shareCode → SharedListPage
│   ├── AppShell
│   │   └── PageHeader
│   ├── ListProgressBar
│   ├── CategoryFilter
│   ├── ItemGrid
│   │   └── ItemCard (×n)
│   │       └── ReserveModal (conditional)
│   └── SuggestItemForm
├── /manage/:adminCode → AdminPage
│   ├── AppShell
│   │   └── PageHeader
│   ├── ShareLinkPanel
│   ├── AdminLinkPanel
│   ├── SheetsSyncStatus
│   ├── ListProgressBar
│   ├── ItemForm (add/edit)
│   ├── ItemTable
│   │   └── DeleteConfirmModal (conditional)
│   └── CategoryFilter
└── * → NotFoundPage
```

## Shared Components (`src/components/shared/`)

### Button
```ts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
}
```

### Input
```ts
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}
```

### Modal
```ts
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

### Badge
```ts
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
}
```

### Spinner
```ts
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

### EmptyState
```ts
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

## Layout Components (`src/components/layout/`)

### AppShell
- Full-page container with max-width, centered
- Mobile-first, padding adjusts at md breakpoint

### PageHeader
```ts
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}
```

## Home Components (`src/components/home/`)

### CreateListForm
- Fields: title, ownerName, babyName, dueDate
- On submit: calls `createList()`, redirects to `/manage/:adminCode`
- Validation: all fields required

### EnterCodeForm
- Input for shareCode or adminCode (detected by length)
- Redirects to appropriate page

## List Components (`src/components/list/`)

### ItemCard
```ts
interface ItemCardProps {
  item: ListItem;
  onReserve: (item: ListItem) => void;
  onMarkPurchased: (item: ListItem) => void;
}
```
- Shows: name, category badge, priority badge, quantity progress, notes
- CTA: "Reservar" (if available), "Marcar como comprado" (if reserved by me)
- Purchased items show green checkmark

### ItemGrid
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- Renders `<ItemCard />` for each item

### CategoryFilter
```ts
interface CategoryFilterProps {
  selected: string | null;
  onChange: (category: string | null) => void;
  counts: Record<string, number>;
}
```

### PriorityBadge
```ts
interface PriorityBadgeProps {
  priority: Priority;
}
```
- high → red badge "Alta"
- medium → yellow badge "Media"
- low → gray badge "Baja"

### ReserveModal
```ts
interface ReserveModalProps {
  item: ListItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
}
```
- Input: "¿Cuál es tu nombre?"
- Calls `reserveItem` transaction

### SuggestItemForm
- Compact form: name, category, notes, suggestedBy name
- Calls `addItem` with the suggestion

### ListProgressBar
```ts
interface ListProgressBarProps {
  total: number;
  purchased: number;
  reserved: number;
}
```
- Shows "X of Y items purchased (Z reserved)"
- Visual progress bar

## Admin Components (`src/components/admin/`)

### ItemForm
```ts
interface ItemFormProps {
  listId: string;
  item?: ListItem; // if provided, edit mode
  onSuccess: () => void;
  onCancel: () => void;
}
```
- Full item creation/edit form
- All fields including imageUrl, notes, priority

### ItemTable
```ts
interface ItemTableProps {
  items: ListItem[];
  onEdit: (item: ListItem) => void;
  onDelete: (item: ListItem) => void;
}
```
- Desktop: table layout
- Mobile: card list
- Columns: Name, Category, Qty, Priority, Status, Actions

### ShareLinkPanel
```ts
interface ShareLinkPanelProps {
  shareCode: string;
}
```
- Displays the shareable URL
- Copy-to-clipboard button

### AdminLinkPanel
```ts
interface AdminLinkPanelProps {
  adminCode: string;
}
```
- Displays the admin URL (keep private!)
- Copy-to-clipboard button

### SheetsSyncStatus
```ts
interface SheetsSyncStatusProps {
  googleSheetId: string | null;
  listId: string;
}
```
- Shows Google Sheet link if connected
- Shows "Not connected" with spinner if pending
- Manual re-sync button

### DeleteConfirmModal
```ts
interface DeleteConfirmModalProps {
  item: ListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}
```
