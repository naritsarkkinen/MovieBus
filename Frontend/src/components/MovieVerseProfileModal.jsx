import { Sparkles, X } from 'lucide-react'

const avatars = ['🧑🏽‍🚀', '👩🏻‍🚀', '🧑🏿‍🎤', '🧑🏼‍🎨', '🦊', '🤖']
const skins = ['violet', 'blue', 'mint', 'rose', 'gold']

// Avatar studio: name, avatar and glow colour.
export default function MovieVerseProfileModal({
  name,
  avatar,
  skin,
  onName,
  onAvatar,
  onSkin,
  onSave,
  pending,
  onClose,
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Avatar studio"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="eyebrow">YOUR IDENTITY</div>
        <h2>Make it yours.</h2>
        <div className="avatar-preview">
          <div className={'player-avatar skin-' + skin}>{avatar}</div>
          <span>{name}</span>
        </div>
        <label htmlFor="mv-display-name">DISPLAY NAME</label>
        <input
          id="mv-display-name"
          className="profile-input"
          value={name}
          disabled={pending}
          onChange={(e) => onName(e.target.value.slice(0, 18))}
        />
        <label>CHOOSE YOUR AVATAR</label>
        <div className="avatar-options">
          {avatars.map((a) => (
            <button
              key={a}
              className={avatar === a ? 'chosen' : ''}
              onClick={() => onAvatar(a)}
              disabled={pending}
            >
              {a}
            </button>
          ))}
        </div>
        <label>SKIN / GLOW</label>
        <div className="skin-options">
          {skins.map((s) => (
            <button
              key={s}
              aria-label={s}
              className={'skin-dot skin-' + s + (skin === s ? ' chosen' : '')}
              onClick={() => onSkin(s)}
              disabled={pending}
            />
          ))}
        </div>
        <button className="primary-button save-profile" onClick={onSave} disabled={pending}>
          Save appearance <Sparkles size={15} />
        </button>
      </div>
    </div>
  )
}
