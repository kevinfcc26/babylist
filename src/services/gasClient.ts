const GAS_URL = import.meta.env.VITE_GAS_URL as string

if (!GAS_URL) {
  console.warn('VITE_GAS_URL is not set. API calls will fail.')
}

/**
 * All requests go as GET to avoid the GAS POST→GET redirect bug.
 * The action is a plain query param; everything else is JSON-encoded
 * in a single `payload` param so we don't pollute the query string.
 *
 * GAS doGet reads: e.parameter.action + JSON.parse(e.parameter.payload)
 */
export async function gasRequest<T>(params: Record<string, unknown>): Promise<T> {
  const { action, ...rest } = params
  const url = new URL(GAS_URL)
  url.searchParams.set('action', String(action))
  if (Object.keys(rest).length > 0) {
    url.searchParams.set('payload', JSON.stringify(rest))
  }

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`GAS error ${res.status}`)

  const data = await res.json() as { ok: boolean; error?: string } & T
  if (!data.ok) throw new Error(data.error ?? 'Unknown GAS error')
  return data
}
