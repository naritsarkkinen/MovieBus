import MovieVersePanel from './MovieVersePanel'

// popup for one friend: invite to the friend room or wave
export default function MovieVerseFriendModal({ friend, invited, onInvite, onWave, onClose }) {
  return (
    <MovieVersePanel eyebrow="FRIEND" title={friend.name} onClose={onClose}>
      <div className="mv-friend-card">
        <div className={'friend-avatar ' + friend.color}>{friend.initial}</div>
        <p>{invited ? 'Hanging out in Friday Film Club' : friend.status}</p>
      </div>
      <div className="mv-panel-actions">
        <button
          className="primary-button"
          disabled={invited}
          onClick={() => onInvite(friend)}
        >
          {invited ? 'Already in Friday Film Club' : 'Invite to Friday Film Club'}
        </button>
        <button className="mv-secondary-button" onClick={() => onWave(friend)}>
          Say hi 👋
        </button>
      </div>
    </MovieVersePanel>
  )
}
