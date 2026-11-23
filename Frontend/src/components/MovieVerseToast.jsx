import { Sparkles } from 'lucide-react'

export default function MovieVerseToast({ message }) {
  if (!message) return null
  return (
    <div className="toast" role="status">
      <Sparkles size={15} />
      {message}
    </div>
  )
}
