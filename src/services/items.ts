import { gasRequest } from './gasClient'
import type { CreateItemInput, UpdateItemInput } from '../types/list'

export async function addItem(
  _listId: string,
  input: CreateItemInput & { adminCode: string }
): Promise<string> {
  const res = await gasRequest<{ itemId: string }>({
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
  await gasRequest({
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
  await gasRequest({ action: 'deleteItem', adminCode, itemId })
}

export async function reserveItem(
  _listId: string,
  itemId: string,
  reservedBy: string,
  shareCode: string
): Promise<void> {
  await gasRequest({ action: 'reserveItem', shareCode, itemId, reservedBy })
}

export async function cancelReservation(
  _listId: string,
  itemId: string,
  reservedBy: string,
  shareCode: string
): Promise<void> {
  await gasRequest({ action: 'cancelReservation', shareCode, itemId, reservedBy })
}

export async function markPurchased(
  _listId: string,
  itemId: string,
  purchasedBy: string,
  shareCode: string
): Promise<void> {
  await gasRequest({ action: 'markPurchased', shareCode, itemId, purchasedBy })
}

export async function suggestItem(
  _listId: string,
  shareCode: string,
  input: Pick<CreateItemInput, 'name' | 'category' | 'notes' | 'addedBy'>
): Promise<string> {
  const res = await gasRequest<{ itemId: string }>({
    action: 'suggestItem',
    shareCode,
    name: input.name,
    category: input.category,
    notes: input.notes ?? '',
    addedBy: input.addedBy,
  })
  return res.itemId
}
