// Shared helper for every call to the MovieVerse API.

// Use Vite's proxy locally, or set VITE_API_URL to a public API base.
export const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export function hasApi(baseUrl = API_URL) {
  return Boolean(baseUrl)
}

// Sends one request and returns the JSON answer.
// Throws an error if there is no API address, the server answers with an
// error status, or there is no answer within 5 seconds.
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
  if (res.status === 204) return null // "No Content"
  return res.json()
}
