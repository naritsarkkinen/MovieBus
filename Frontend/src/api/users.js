import { apiRequest } from './client'

export function toUser(row) {
  return {
    id: row.id,
    name: row.display_name,
    avatar: row.avatar_emoji,
    skin: row.skin,
  }
}

export async function authenticate(mode, credentials, options) {
  const { token, user } = await apiRequest('/auth/' + mode, {
    ...options,
    method: 'POST',
    body: credentials,
  })
  return { token, profile: toUser(user) }
}

export async function saveAvatar(session, { name, avatar, skin }, options) {
  const row = await apiRequest(`/users/${session.profile.id}/avatar`, {
    ...options,
    token: session.token,
    method: 'PATCH',
    body: { display_name: name.trim(), avatar_emoji: avatar, skin },
  })
  return toUser(row)
}
