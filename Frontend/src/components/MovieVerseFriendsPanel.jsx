import { useState } from 'react'
import { MoveUpRight, Radio, X } from 'lucide-react'

export default function MovieVerseFriendsPanel({
  friends,
  onAddFriend,
  onRemoveFriend,
  invited,
  joined,
  onClose,
  onInviteLink,
  onOpenFriend,
  onToggleRoom,
}) {
  const [nameError, setNameError] = useState('')

  function submitFriend(event) {
    event.preventDefault()
    const input = event.currentTarget.elements.friendName
    const error = onAddFriend(input.value)
    setNameError(error)
    if (!error) event.currentTarget.reset()
  }

  return (
    <aside className="friends-panel">
      <div className="friends-head">
        <div>
          <div className="eyebrow">YOUR ORBIT</div>
          <h3>
            Friends <span>{String(friends.length).padStart(2, '0')}</span>
          </h3>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <button className="invite-button" onClick={onInviteLink}>
        <span>＋</span> Invite friends
      </button>
      <form className="add-friend" onSubmit={submitFriend}>
        <label htmlFor="friend-name">Friend name</label>
        <input
          id="friend-name"
          name="friendName"
          required
          maxLength={40}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? 'friend-name-error' : undefined}
          onInput={() => setNameError('')}
        />
        <button type="submit">Add friend</button>
        {nameError && <small id="friend-name-error" role="alert">{nameError}</small>}
      </form>
      <div className="friend-list">
        {friends.length === 0 && <p>No friends yet.</p>}
        {friends.map((f) => (
          <div className="friend-row" key={f.name}>
            <button className="friend" onClick={() => onOpenFriend(f)}>
              <div className={'friend-avatar ' + f.color}>{f.initial}</div>
              <div>
                <b>{f.name}</b>
                <small>
                  {invited.has(f.name) ? 'In Friday Film Club' : f.status}
                </small>
              </div>
              <i />
            </button>
            <button
              className="remove-friend"
              aria-label={'Remove ' + f.name}
              onClick={() => onRemoveFriend(f)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="room-card">
        <div className="room-art">✦</div>
        <div>
          <span className="eyebrow">FRIEND ROOM</span>
          <b>Friday Film Club</b>
          <small>
            {2 + invited.size + (joined ? 1 : 0)} / 6 explorers inside
          </small>
        </div>
        <button onClick={onToggleRoom}>
          {joined ? 'Leave' : 'Join'} <MoveUpRight size={12} />
        </button>
      </div>
      <div className="activity">
        <div className="eyebrow">RECENT ACTIVITY</div>
        <p>
          <span className="activity-dot" /> <b>Mila</b> rated{' '}
          <b>Dune: Part Two</b>
        </p>
        <small>12 minutes ago</small>
        <p>
          <span className="activity-dot purple" /> <b>Alex</b> joined the
          universe
        </p>
        <small>34 minutes ago</small>
      </div>
      <div className="friends-note">
        <Radio size={14} /> Friends presence is simulated in this demo.
      </div>
    </aside>
  )
}
