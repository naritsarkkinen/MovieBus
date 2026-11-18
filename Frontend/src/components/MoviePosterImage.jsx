import { useState } from 'react'

// no image / broken image → render nothing, emoji card shows instead
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
