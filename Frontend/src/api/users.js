import { API_URL, apiRequest } from './client'

const GUEST_KEY = 'mv-guest'

// one create request at a time → no double guests
let pendingGuest = null

export function toUser(row) {
  return {
    id: row.id,
    name: row.display_name,
    avatar: row.avatar_emoji,
    skin: row.skin,
  }
}

export function savedUser() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY))
  } catch {
    return null
  }
}

function rememberUser(row) {
  const user = toUser(row)
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(user))
  } catch {
    // localStorage blocked → guest is made again after reload
  }
  return user
}

export async function ensureUser(name, { baseUrl = API_URL } = {}) {
  const existing = savedUser()
  if (existing?.id) return existing

  if (!pendingGuest) {
    pendingGuest = apiRequest('/users', {
      baseUrl,
      method: 'POST',
      body: { display_name: name.trim() },
    })
      .then(rememberUser)
      .finally(() => {
        pendingGuest = null
      })
  }
  return pendingGuest
}

export async function saveAvatar(userId, { name, avatar, skin }, { baseUrl = API_URL } = {}) {
  const row = await apiRequest(`/users/${userId}/avatar`, {
    baseUrl,
    method: 'PATCH',
    body: { display_name: name.trim(), avatar_emoji: avatar, skin },
  })
  return rememberUser(row)
}
