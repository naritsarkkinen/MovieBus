import { useEffect, useState } from 'react'

// short message at the bottom of the screen, hides itself after a moment
export default function useToast(duration = 2300) {
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), duration)
    return () => clearTimeout(t)
  }, [toast, duration])

  return [toast, setToast]
}
