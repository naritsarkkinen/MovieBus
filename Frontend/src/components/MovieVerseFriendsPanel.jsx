import { useState } from 'react'
import { MoveUpRight, Radio, X } from 'lucide-react'
import { ROOM_CAPACITY, roomOccupancy } from '../data/MovieVerseData'

function RecipientInvitation({ friend, full, onRespond }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="recipient-invite">
      <button aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        View invitation as {friend.name}
      </button>
      {expanded && (
        <div role="group" aria-label={'Demo invitation for ' + friend.name}>
          <p>Demo as {friend.name}: you’re invited to Friday Film Club.</p>
          {full && <p>The room is full.</p>}
          <button disabled={full} onClick={() => onRespond(friend, true)}>Accept</button>
          <button onClick={() => onRespond(friend, false)}>Decline</button>
        </div>
      )}
    </div>
  )
}

function friendStatus(friend, invited, accepted, declined) {
  if (accepted.has(friend.name)) return 'In Friday Film Club'
  if (declined.has(friend.name)) return 'Invitation declined'
  if (invited.has(friend.name)) return 'Invitation pending'
  return friend.status
}

export default function MovieVerseFriendsPanel({
  friends,
  onAddFriend,
  onRemoveFriend,
  invited,
  accepted,
  declined,
  joined,
  onClose,
  onInvite,
  onRespondToInvite,
  onOpenFriend,
  onToggleRoom,
}) {
  const [nameError, setNameError] = useState('')
  const [invitesOpen, setInvitesOpen] = useState(false)
  const occupancy = roomOccupancy(accepted.size, joined)
  const full = occupancy >= ROOM_CAPACITY

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
      <button className="invite-button" aria-expanded={invitesOpen}
        onClick={() => setInvitesOpen((open) => !open)}>
        <span>＋</span> Invite friends
      </button>
      {invitesOpen && (
        <section className="party-invites" aria-label="Invite to Friday Film Club">
          <h4>Invite to Friday Film Club</h4>
          {friends.length === 0 && <p>Add a friend to send an invitation.</p>}
          {friends.map((friend) => (
            <div className="friend-row" key={friend.name}>
              <span>{friend.name}</span>
              <button
                disabled={invited.has(friend.name) || accepted.has(friend.name)}
                aria-label={'Invite ' + friend.name + ' to Friday Film Club'}
                onClick={() => onInvite(friend)}
              >
                {accepted.has(friend.name) ? 'In room' : invited.has(friend.name) ? 'Invitation sent' : 'Send invite'}
              </button>
              {invited.has(friend.name) && (
                <RecipientInvitation friend={friend} full={full} onRespond={onRespondToInvite} />
              )}
            </div>
          ))}
        </section>
      )}
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
                  {friendStatus(f, invited, accepted, declined)}
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
            {occupancy} / {ROOM_CAPACITY} explorers inside
          </small>
        </div>
        <button onClick={onToggleRoom} disabled={!joined && full}>
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
