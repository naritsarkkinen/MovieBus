import { useEffect, useRef } from 'react'

// layers = [[isOpen, close], ...] from top-most to bottom.
// Escape closes the first layer that is open.
// ref = always the newest layers, so the listener is added only once
export default function useEscapeKey(layers) {
  const layersRef = useRef(layers)

  useEffect(() => {
    layersRef.current = layers
  })

  useEffect(() => {
    const handle = (e) => {
      if (e.key !== 'Escape') return
      const top = layersRef.current.find(([isOpen]) => isOpen)
      if (top) top[1]()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])
}
