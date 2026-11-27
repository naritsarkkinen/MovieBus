import { useMemo, useState } from 'react'
import { friends as demoFriends } from '../data/MovieVerseData'

function groupInvitations(invitations) {
  const groups = { pending: new Set(), accepted: new Set(), declined: new Set() }
  for (const [name, status] of invitations) groups[status].add(name)
  return groups
}

// friends side panel, the friend popup and who you invited (demo)
export default function useFriends(notify, initiallyOpen = false) {
  const [list, setList] = useState(demoFriends)
  const [panelOpen, setPanelOpen] = useState(initiallyOpen)
  const [openFriend, setOpenFriend] = useState(null)
  const [invitations, setInvitations] = useState(() => new Map())
  const { pending: invited, accepted, declined } = useMemo(
    () => groupInvitations(invitations), [invitations],
  )

  function addFriend(value) {
    const name = value.trim()
    if (!name) return 'Enter a friend name.'
    const matches = (friend) => friend.name.toLowerCase() === name.toLowerCase()
    if (list.some(matches)) return 'This friend is already on your list.'
    const friend = demoFriends.find(matches) ?? {
      name,
      initial: Array.from(name)[0].toUpperCase(),
      color: 'lavender',
      status: 'In the lobby',
    }
    setList((current) => current.some(matches) ? current : [...current, friend])
    notify(friend.name + ' added to your friends')
    return ''
  }

  function removeFriend(friend) {
    setList((current) => current.filter((item) => item.name !== friend.name))
    setInvitations((current) => {
      if (!current.has(friend.name)) return current
      const next = new Map(current)
      next.delete(friend.name)
      return next
    })
    setOpenFriend((current) => current?.name === friend.name ? null : current)
    notify(friend.name + ' removed from your friends')
  }

  function invite(friend) {
    if (invited.has(friend.name) || accepted.has(friend.name)) return
    setInvitations((current) => {
      const status = current.get(friend.name)
      if (status === 'pending' || status === 'accepted') return current
      return new Map(current).set(friend.name, 'pending')
    })
    notify('Friday Film Club invitation sent to ' + friend.name)
    setOpenFriend(null)
  }

  function respondToInvite(friend, accept) {
    setInvitations((current) => {
      if (current.get(friend.name) !== 'pending') return current
      return new Map(current).set(friend.name, accept ? 'accepted' : 'declined')
    })
  }

  function wave(friend) {
    notify('You waved at ' + friend.name + ' 👋')
    setOpenFriend(null)
  }

  return {
    list,
    addFriend,
    removeFriend,
    panelOpen,
    openPanel: () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false),
    togglePanel: () => setPanelOpen((v) => !v),
    openFriend,
    showFriend: setOpenFriend,
    closeFriend: () => setOpenFriend(null),
    invited,
    accepted,
    declined,
    isInvited: (friend) => Boolean(friend) && invited.has(friend.name),
    invite,
    respondToInvite,
    wave,
  }
}
