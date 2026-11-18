import { apiRequest } from './client'

export function toCommunity(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    members: Number(row.member_count ?? 0),
  }
}

export async function fetchCommunities(options) {
  const rows = await apiRequest('/communities', options)
  if (!Array.isArray(rows)) throw new Error('Invalid community list')
  return rows.map(toCommunity)
}
