import { useState } from 'react'

const FRIEND_ROOM = 'Friday Film Club'

// joining / leaving communities (demo, not saved to the API yet).
// Friday Film Club = community AND friend room
export default function useCommunityMembership(notify) {
  const [joined, setJoined] = useState(false)
  const [memberships, setMemberships] = useState(() => new Set())

  function isMember(community) {
    return community.name === FRIEND_ROOM ? joined : memberships.has(community.id)
  }

  function toggleRoom() {
    setJoined(!joined)
    notify(joined ? 'You left the room (demo)' : `You joined ${FRIEND_ROOM} (demo)`)
  }

  function toggleCommunity(community) {
    if (community.name === FRIEND_ROOM) {
      toggleRoom()
      return
    }
    const member = memberships.has(community.id)
    setMemberships((set) => {
      const next = new Set(set)
      if (member) next.delete(community.id)
      else next.add(community.id)
      return next
    })
    notify((member ? 'You left ' : 'You joined ') + community.name + ' (demo)')
  }

  return { joined, isMember, toggleRoom, toggleCommunity }
}
