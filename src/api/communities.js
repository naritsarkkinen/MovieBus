import { apiRequest, listFrom } from './client'

// Azure "clubs" table: club_id, name, is_public (+ member count from club_members)
export function toCommunity(row) {
  let description = row.description
  if (!description) {
    description = row.is_public === false ? 'Private club' : 'Public club'
  }
  return {
    id: row.id ?? row.club_id,
    name: row.name,
    description,
    members: Number(row.member_count ?? row.members ?? 0),
  }
}

// GET /api/communities
export async function fetchCommunities(options) {
  const body = await apiRequest('/communities', options)
  return listFrom(body, 'communities').map(toCommunity)
}

// POST /api/communities/:id/join   { user_id }
export function joinCommunity(communityId, userId, options) {
  return apiRequest(`/communities/${communityId}/join`, {
    method: 'POST',
    body: { user_id: userId },
    ...options,
  })
}
