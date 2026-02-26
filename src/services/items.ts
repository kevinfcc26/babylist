import { gasPost } from './gasClient'
import type { CreateItemInput, UpdateItemInput } from '../types/list'

export async function addItem(
  _listId: string,
  input: CreateItemInput & { adminCode: string }
): Promise<string> {
  const res = await gasPost<{ itemId: string }>({
    action: 'addItem',
    adminCode: input.adminCode,
    name: input.name,
    category: input.category,
    quantity: input.quantity,
    priority: input.priority,
    imageUrl: input.imageUrl ?? '',
    notes: input.notes ?? '',
    addedBy: input.addedBy,
  })
  return res.itemId
}

export async function updateItem(
  _listId: string,
  itemId: string,
  data: UpdateItemInput & { adminCode: string }
): Promise<void> {
  const { adminCode, ...fields } = data
  await gasPost({
    action: 'updateItem',
    adminCode,
    itemId,
    ...fields,
  })
}

export async function deleteItem(
  _listId: string,
  itemId: string,
  adminCode: string
): Promise<void> {
  await gasPost({ action: 'deleteItem', adminCode, itemId })
}

export async function reserveItem(
  _listId: string,
  itemId: string,
  reservedBy: string,
  shareCode: string
): Promise<void> {
  await gasPost({ action: 'reserveItem', shareCode, itemId, reservedBy })
}

export async function cancelReservation(
  _listId: string,
  itemId: string,
  reservedBy: string,
  shareCode: string
): Promise<void> {
  await gasPost({ action: 'cancelReservation', shareCode, itemId, reservedBy })
}

export async function markPurchased(
  _listId: string,
  itemId: string,
  purchasedBy: string,
  shareCode: string
): Promise<void> {
  await gasPost({ action: 'markPurchased', shareCode, itemId, purchasedBy })
}

export async function suggestItem(
  _listId: string,
  shareCode: string,
  input: Pick<CreateItemInput, 'name' | 'category' | 'notes' | 'addedBy'>
): Promise<string> {
  const res = await gasPost<{ itemId: string }>({
    action: 'suggestItem',
    shareCode,
    name: input.name,
    category: input.category,
    notes: input.notes ?? '',
    addedBy: input.addedBy,
  })
  return res.itemId
}
