import { useState } from 'react'
import { friends as demoFriends } from '../data/MovieVerseData'

// friends side panel, the friend popup and who you invited (demo)
export default function useFriends(notify) {
  const [list, setList] = useState(demoFriends)
  const [panelOpen, setPanelOpen] = useState(false)
  const [openFriend, setOpenFriend] = useState(null)
  const [invited, setInvited] = useState(() => new Set())

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
    setInvited((current) => {
      const next = new Set(current)
      next.delete(friend.name)
      return next
    })
    setOpenFriend((current) => current?.name === friend.name ? null : current)
    notify(friend.name + ' removed from your friends')
  }

  function invite(friend) {
    setInvited((set) => new Set(set).add(friend.name))
    notify('Friday Film Club invitation sent to ' + friend.name)
    setOpenFriend(null)
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
    isInvited: (friend) => Boolean(friend) && invited.has(friend.name),
    invite,
    wave,
  }
}
