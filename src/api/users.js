import { apiRequest } from './client'

// The explorer's account in the database (guest user until login exists).
// Saved in the browser so the same user is used again after a page reload.
const STORAGE_KEY = 'mv-user'

// Backend answer (users table): { id, display_name, avatar_emoji, skin }
export function toUser(row) {
  return { id: row.id, name: row.display_name }
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
    // storage is blocked: the user is created again next time
  }
}

// Returns the saved user, or creates a guest user once.
// POST /api/users   { display_name }
export async function ensureUser(name, options) {
  const existing = savedUser()
  if (existing?.id) return existing

  const row = await apiRequest('/users', {
    method: 'POST',
    body: { display_name: name },
    ...options,
  })
  const user = toUser(row)
  if (!user.id) throw new Error('API did not return a user id')
  rememberUser(user)
  return user
}

// PATCH /api/users/:id/avatar   { display_name, avatar_emoji, skin }
export function saveAvatar(userId, { name, avatar, skin }, options) {
  return apiRequest(`/users/${userId}/avatar`, {
    method: 'PATCH',
    body: { display_name: name, avatar_emoji: avatar, skin },
    ...options,
  })
}
