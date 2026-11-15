import { apiRequest } from './client'

// The explorer's account in the database (guest mode until login exists).
// Saved in the browser so the same user is reused after a page reload.
const STORAGE_KEY = 'mv-user'

// Database rows use user_id + nickname (Azure "users" table)
export function toUser(row) {
  return {
    id: row.id ?? row.user_id,
    name: row.nickname ?? row.display_name ?? row.name,
  }
}

export function savedUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function rememberUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // storage unavailable: the user is created again next time
  }
}

// Returns the saved user, or creates a guest user once: POST /api/users
export async function ensureUser(nickname, options) {
  const existing = savedUser()
  if (existing?.id) return existing
  const row = await apiRequest('/users', {
    method: 'POST',
    body: { nickname },
    ...options,
  })
  const user = toUser(row)
  if (!user.id) throw new Error('API did not return a user id')
  rememberUser(user)
  return user
}

// PATCH /api/users/:id/avatar
export function saveAvatar(userId, { nickname, avatar, skin }, options) {
  return apiRequest(`/users/${userId}/avatar`, {
    method: 'PATCH',
    body: { nickname, avatar, skin },
    ...options,
  })
}
