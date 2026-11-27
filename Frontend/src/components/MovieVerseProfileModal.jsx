import { useState } from 'react'
import { Shield, Sparkles, X } from 'lucide-react'

const avatars = ['🧑🏽‍🚀', '👩🏻‍🚀', '🧑🏿‍🎤', '🧑🏼‍🎨', '🦊', '🤖']
const skins = ['violet', 'blue', 'mint', 'rose', 'gold']

export default function MovieVerseProfileModal({
  name,
  avatar,
  skin,
  onName,
  onAvatar,
  onSkin,
  signedIn,
  onAuthenticate,
  onSave,
  pending,
  onClose,
  onOpenAdmin,
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
        {signedIn ? <>
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
            maxLength={40}
            onChange={(e) => onName(e.target.value)}
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

        </> : <AccountForm pending={pending} onAuthenticate={onAuthenticate} />}

        {import.meta.env.DEV &&  signedIn && onOpenAdmin && (
          <button
            type="button"
            className="primary-button"
            onClick={onOpenAdmin}
            style={{ width: '100%', marginTop: 12 }}
          >
            <Shield size={16} /> Admin Control Center
          </button>
        )}
      </div>
    </div>
  )
}

function AccountForm({ pending, onAuthenticate }) {
  const [signup, setSignup] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const credentials = Object.fromEntries(new FormData(event.currentTarget))
    setError('')
    try {
      await onAuthenticate(signup ? 'signup' : 'login', credentials)
    } catch (problem) {
      setError(problem.message)
    }
  }

  return (
    <form onSubmit={submit}>
      <p>Sign in to edit your explorer profile.</p>
      <fieldset disabled={pending}>
        {signup && <label>Display name
          <input className="profile-input" name="display_name" required minLength={2} maxLength={40} />
        </label>}
        <label>Email
          <input className="profile-input" type="email" name="email" autoComplete="username" required />
        </label>
        <label>Password
          <input className="profile-input" type="password" name="password" required
            autoComplete={signup ? 'new-password' : 'current-password'} />
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="primary-button">{signup ? 'Create account' : 'Sign in'}</button>
        <button type="button" onClick={() => {
          setSignup(!signup)
          setError('')
        }}>
          {signup ? 'Use existing account' : 'Create an account'}
        </button>
      </fieldset>
    </form>
  )
}
