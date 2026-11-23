import MovieVersePanel from './MovieVersePanel'

export default function MovieVerseCommunities({ communities, isMember, onToggle, onClose }) {
  return (
    <MovieVersePanel eyebrow="COMMUNITIES" title="Find your people" onClose={onClose}>
      <div className="mv-community-list">
        {communities.map((c) => {
          const member = isMember(c)
          return (
            <div className="mv-community" key={c.id}>
              <div>
                <b>{c.name}</b>
                <small>{c.description}</small>
                <small>{c.members + (member ? 1 : 0)} members</small>
              </div>
              <button className={member ? 'joined' : ''} onClick={() => onToggle(c)}>
                {member ? 'Leave' : 'Join'}
              </button>
            </div>
          )
        })}
      </div>
    </MovieVersePanel>
  )
}
