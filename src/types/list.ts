export const CATEGORIES = [
  'Ropa',
  'Mobiliario',
  'Higiene',
  'Juguetes',
  'Alimentación',
  'Otros',
] as const

export type Category = (typeof CATEGORIES)[number]

export const PRIORITIES = ['high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface BabyList {
  id: string
  title: string
  ownerName: string
  babyName: string
  dueDate: string
  shareCode: string
  adminCode?: string        // only present when accessed via adminCode
  googleSheetId: string | null
  createdAt: string         // ISO date string
}

export interface ListItem {
  id: string
  name: string
  category: Category
  quantity: number
  quantityPurchased: number
  priority: Priority
  reservedBy: string | null
  purchasedBy: string | null
  isPurchased: boolean
  isReserved: boolean
  imageUrl: string | null
  notes: string
  addedBy: string
  createdAt: string         // ISO date string
}

export type CreateListInput = Pick<
  BabyList,
  'title' | 'ownerName' | 'babyName' | 'dueDate'
>

export type CreateItemInput = Pick<
  ListItem,
  'name' | 'category' | 'quantity' | 'priority' | 'imageUrl' | 'notes' | 'addedBy'
>

export type UpdateItemInput = Partial<
  Pick<ListItem, 'name' | 'category' | 'quantity' | 'priority' | 'imageUrl' | 'notes'>
>
