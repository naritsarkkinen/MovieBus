// Shared helper for every call to the MovieBus API.

// Base address, e.g. http://localhost:4000/api (set VITE_API_URL in .env).
// Not a secret: Vite puts it in the public JavaScript.
export const API_URL = import.meta.env.VITE_API_URL

// true when an API address is configured
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
  if (!res.ok) throw new Error('API answered ' + res.status)
  if (res.status === 204) return null // "No Content"
  return res.json()
}

// Lists can come as [ ... ] or wrapped like { results: [ ... ] }
export function listFrom(body, key) {
  if (Array.isArray(body)) return body
  return body?.[key] || body?.results || []
}
