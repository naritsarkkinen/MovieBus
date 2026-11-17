import { apiRequest, listFrom } from './client'

// Backend answer (communities table): { id, name, description, member_count }
export function toCommunity(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    members: Number(row.member_count || 0),
  }
}

// GET /api/communities
export async function fetchCommunities(options) {
  const body = await apiRequest('/communities', options)
  return listFrom(body, 'communities').map(toCommunity)
}

// POST /api/communities/:id/join   { user_id }
// Not in the backend yet: until it is, joining is only saved on this device.
export function joinCommunity(communityId, userId, options) {
  return apiRequest(`/communities/${communityId}/join`, {
    method: 'POST',
    body: { user_id: userId },
    ...options,
  })
}
