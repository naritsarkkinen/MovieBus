import { API_URL, apiRequest } from './client'

const guests = new Map()
const pendingGuests = new Map()

function guestKey(baseUrl) {
  const url = new URL(baseUrl, globalThis.location?.origin || 'http://localhost')
  return 'mv-guest:' + url.href.replace(/\/$/, '')
}

export function toUser(row) {
  return {
    id: row.id,
    name: row.display_name,
    avatar: row.avatar_emoji,
    skin: row.skin,
  }
}

export function savedUser(baseUrl = API_URL) {
  if (!baseUrl) return null
  const key = guestKey(baseUrl)
  if (guests.has(key)) return guests.get(key)
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

function rememberUser(baseUrl, row) {
  const user = toUser(row)
  if (!user.id) throw new Error('API did not return a user id')
  const key = guestKey(baseUrl)
  guests.set(key, user)
  try {
    localStorage.setItem(key, JSON.stringify(user))
  } catch {
    // The guest can still be reused until the page reloads.
  }
  return user
}

export async function ensureUser(name, { baseUrl = API_URL } = {}) {
  if (!baseUrl) throw new Error('No API address configured')
  const existing = savedUser(baseUrl)
  if (existing?.id) return existing
  const key = guestKey(baseUrl)
  if (!pendingGuests.has(key)) {
    const request = apiRequest('/users', {
      baseUrl,
      method: 'POST',
      body: { display_name: name.trim() },
    }).then((row) => rememberUser(baseUrl, row))
      .finally(() => pendingGuests.delete(key))
    pendingGuests.set(key, request)
  }
  return pendingGuests.get(key)
}

export async function saveAvatar(userId, { name, avatar, skin }, { baseUrl = API_URL } = {}) {
  const row = await apiRequest(`/users/${userId}/avatar`, {
    baseUrl,
    method: 'PATCH',
    body: { display_name: name.trim(), avatar_emoji: avatar, skin },
  })
  return rememberUser(baseUrl, row)
}
