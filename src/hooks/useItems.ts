// Items are now bundled with the list response from GAS.
// Use useList() or useAdminList() which both return { list, items }.
// This file is kept for backwards compatibility but is no longer used directly.

export function useItems(_listId: string | null) {
  return { items: [], loading: false, error: null }
}
