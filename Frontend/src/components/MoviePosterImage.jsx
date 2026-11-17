import { useState } from 'react'

// Real poster image. If there is no image, or it fails to load, it renders
// nothing and the coloured card with the emoji underneath stays visible.
export default function MoviePosterImage({ src, title }) {
  const [failedSrc, setFailedSrc] = useState(null)
  if (!src || failedSrc === src) return null
  return (
    <img
      className="poster-img"
      src={src}
      alt={title + ' poster'}
      loading="lazy"
      draggable="false"
      onError={() => setFailedSrc(src)}
    />
  )
}
