import { useState } from 'react'

// friends side panel, the friend popup and who you invited (demo)
export default function useFriends(notify) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [openFriend, setOpenFriend] = useState(null)
  const [invited, setInvited] = useState(() => new Set())

  function invite(friend) {
    setInvited((set) => new Set(set).add(friend.name))
    notify(friend.name + ' is heading to Friday Film Club')
    setOpenFriend(null)
  }

  function wave(friend) {
    notify('You waved at ' + friend.name + ' 👋')
    setOpenFriend(null)
  }

  return {
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
