import MovieVersePanel from './MovieVersePanel'

// popup for one friend: invite to the friend room or wave
export default function MovieVerseFriendModal({ friend, invited, accepted, declined, onInvite, onWave, onClose }) {
  let status = friend.status
  let inviteLabel = 'Invite to Friday Film Club'
  if (invited) {
    status = 'Invitation pending'
    inviteLabel = 'Invitation sent'
  } else if (accepted) {
    status = 'In Friday Film Club'
    inviteLabel = 'Invitation accepted'
  } else if (declined) {
    status = 'Invitation declined'
    inviteLabel = 'Invite again'
  }

  return (
    <MovieVersePanel eyebrow="FRIEND" title={friend.name} onClose={onClose}>
      <div className="mv-friend-card">
        <div className={'friend-avatar ' + friend.color}>{friend.initial}</div>
        <p>{status}</p>
      </div>
      <div className="mv-panel-actions">
        <button
          className="primary-button"
          disabled={invited || accepted}
          onClick={() => onInvite(friend)}
        >
          {inviteLabel}
        </button>
        <button className="mv-secondary-button" onClick={() => onWave(friend)}>
          Say hi 👋
        </button>
      </div>
    </MovieVersePanel>
  )
}
