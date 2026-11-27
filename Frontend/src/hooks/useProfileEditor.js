import { useState } from 'react'
import { authenticate, saveAvatar } from '../api/users'

const GUEST = { name: 'Guest', skin: 'violet', avatar: '🧑🏽‍🚀' }

// login session + Avatar Studio draft.
// draft = null → studio closed
export default function useProfileEditor(notify) {
  const [session, setSession] = useState(null)
  const [draft, setDraft] = useState(null)
  const [pending, setPending] = useState(false)
  const profile = session?.profile ?? GUEST

  function change(field, value) {
    setDraft((d) => ({ ...d, [field]: value }))
  }

  // pending = true while waiting for the API → buttons are disabled
  async function withPending(action) {
    if (pending) return
    setPending(true)
    try {
      await action()
    } finally {
      setPending(false)
    }
  }

  function signIn(mode, credentials) {
    return withPending(async () => {
      const account = await authenticate(mode, credentials)
      setSession(account)
      setDraft(account.profile)
    })
  }

  function save() {
    if (draft.name.trim().length < 2) {
      notify('Display name must be at least 2 characters')
      return
    }
    return withPending(async () => {
      try {
        const saved = await saveAvatar(session, draft)
        setSession((s) => ({ ...s, profile: saved }))
        setDraft(null)
        notify('Your explorer profile was saved')
      } catch (error) {
        if (error.status === 401) setSession(null) // token expired → log out
        notify('Save failed: ' + error.message)
      }
    })
  }

  return {
    session,
    profile,
    draft,
    pending,
    open: () => setDraft(profile),
    close: () => {
      if (!pending) setDraft(null)
    },
    change,
    signIn,
    save,
    expire: () => setSession(null),
  }
}
