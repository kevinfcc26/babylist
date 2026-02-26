const GAS_URL = import.meta.env.VITE_GAS_URL as string

if (!GAS_URL) {
  console.warn('VITE_GAS_URL is not set. API calls will fail.')
}

/**
 * GET request to GAS Web App via query params.
 */
export async function gasGet<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(GAS_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`GAS request failed: ${res.status}`)

  const data = await res.json() as { ok: boolean; error?: string } & T
  if (!data.ok) throw new Error(data.error ?? 'Unknown GAS error')
  return data
}

/**
 * POST request to GAS Web App.
 * Uses Content-Type: text/plain to avoid CORS preflight (GAS limitation).
 */
export async function gasPost<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    // text/plain avoids OPTIONS preflight; GAS reads e.postData.contents regardless
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`GAS request failed: ${res.status}`)

  const data = await res.json() as { ok: boolean; error?: string } & T
  if (!data.ok) throw new Error(data.error ?? 'Unknown GAS error')
  return data
}
