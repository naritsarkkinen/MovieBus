export const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function apiRequest(
  path,
  { method = 'GET', body, baseUrl = API_URL } = {},
) {
  if (!baseUrl) throw new Error('No API address configured')

  const res = await fetch(baseUrl.replace(/\/$/, '') + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) {
    const problem = await res.json().catch(() => null)
    throw new Error(problem?.error || 'API answered ' + res.status)
  }
  if (res.status === 204) return null // 204 = no body
  return res.json()
}
