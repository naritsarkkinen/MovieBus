import { useState } from 'react'
import { authenticate } from '../api/users'

const GUEST = { name: 'Hämi', skin: 'violet', avatar: '🧑🏽‍🚀' }

// login session + Avatar Studio draft.
// draft = null → studio closed
export default function useProfileEditor() {
  const [session, setSession] = useState(null)
  const [draft, setDraft] = useState(null)
  const [pending, setPending] = useState(false)
  const profile = session?.profile ?? GUEST

  function change(field, value) {
    setDraft((d) => ({ ...d, [field]: value }))
  }

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

  // api = useMovieVerseApi (needs the session, so it is passed in later)
  function save(api) {
    return withPending(async () => {
      const saved = await api.sendProfile(draft)
      if (saved) {
        setSession((s) => ({ ...s, profile: saved }))
        setDraft(null)
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
