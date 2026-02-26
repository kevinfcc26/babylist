import { gasRequest } from './gasClient'
import type { BabyList, CreateListInput } from '../types/list'

interface CreateListResponse {
  shareCode: string
  adminCode: string
  spreadsheetId: string
  listId: string
}

export async function createList(input: CreateListInput): Promise<BabyList> {
  const res = await gasRequest<CreateListResponse>({
    action: 'createList',
    ...input,
  })

  return {
    id: res.listId,
    title: input.title,
    ownerName: input.ownerName,
    babyName: input.babyName,
    dueDate: input.dueDate,
    shareCode: res.shareCode,
    adminCode: res.adminCode,
    googleSheetId: res.spreadsheetId,
    createdAt: new Date().toISOString(),
  }
}
