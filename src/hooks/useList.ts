import { useState, useEffect, useRef, useCallback } from 'react'
import { gasRequest } from '../services/gasClient'
import type { BabyList, ListItem } from '../types/list'

const POLL_INTERVAL_MS = 10_000

interface GetListResponse {
  list: BabyList & { listId?: string }
  items: (ListItem & { id?: string; itemId?: string })[]
}

export function useList(shareCode: string) {
  const [list, setList] = useState<BabyList | null>(null)
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchList = useCallback(async () => {
    if (!shareCode) return
    try {
      const data = await gasRequest<GetListResponse>({ action: 'getList', shareCode })
      // Normalize id field (GAS returns listId)
      const normalizedList: BabyList = {
        ...data.list,
        id: data.list.id ?? data.list.listId ?? '',
      }
      const normalizedItems: ListItem[] = data.items.map(item => ({
        ...item,
        id: item.id ?? item.itemId ?? '',
      }))
      setList(normalizedList)
      setItems(normalizedItems)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la lista')
    } finally {
      setLoading(false)
    }
  }, [shareCode])

  useEffect(() => {
    if (!shareCode) return

    fetchList()

    // Poll every 10s, but only when tab is visible
    timerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') fetchList()
    }, POLL_INTERVAL_MS)

    const onVisible = () => fetchList()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [shareCode, fetchList])

  return { list, items, loading, error, refresh: fetchList }
}
