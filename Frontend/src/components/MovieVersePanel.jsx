import { X } from 'lucide-react'

export default function MovieVersePanel({
  eyebrow,
  title,
  onClose,
  wide,
  children,
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={'mv-panel' + (wide ? ' wide' : '')}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
