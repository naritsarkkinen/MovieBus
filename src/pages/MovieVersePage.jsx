import React, { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import './MovieVersePage.css'
import { initialMovies } from '../data/MockMovies'
import { loadMovies } from '../api/movies'
import { zones, friends } from '../data/MovieVerseData'
import useMovieVerseApi from '../hooks/useMovieVerseApi'
import MovieVerseMovieCard from '../components/MovieVerseMovieCard'
import MovieVerseWorld from '../components/MovieVerseWorld'
import MovieVerseHud from '../components/MovieVerseHud'
import MovieVersePanel from '../components/MovieVersePanel'
import MovieVerseFriendsPanel from '../components/MovieVerseFriendsPanel'
import MovieVerseMovieModal from '../components/MovieVerseMovieModal'
import MovieVerseProfileModal from '../components/MovieVerseProfileModal'

// The whole page is the walkable world. Everything else (catalogue, friends,
// communities, watchlist, movie details) opens on top of it as an overlay.
// eslint-disable-next-line max-lines-per-function
export default function MovieVersePage() {
  const [movies, setMovies] = useState(initialMovies)
  const [dataSource, setDataSource] = useState('loading') // 'loading' | 'live' | 'sample'
  const [zone, setZone] = useState('trending')
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')

  // profile / avatar
  const [name, setName] = useState('Hämi')
  const [skin, setSkin] = useState('violet')
  const [avatar, setAvatar] = useState('🧑🏽‍🚀')

  // what is open on top of the world
  const [selected, setSelected] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [friendOpen, setFriendOpen] = useState(null)
  const [overlay, setOverlay] = useState(null) // 'catalogue' | 'communities' | 'watchlist'
  const [friendsOpen, setFriendsOpen] = useState(false)

  // demo data that will later come from the API
  const [myRatings, setMyRatings] = useState({})
  const [review, setReview] = useState('')
  const [watchlist, setWatchlist] = useState([])
  const [joined, setJoined] = useState(false)
  const [memberships, setMemberships] = useState(() => new Set())
  const [invited, setInvited] = useState(() => new Set())
  const [toast, setToast] = useState('')

  // saving / loading ratings, reviews, communities and the profile
  const api = useMovieVerseApi({
    name,
    avatar,
    skin,
    selected,
    notify: setToast,
  })
  const filmClub = api.communities.find((c) => c.name === 'Friday Film Club')

  // movies come from the API (Azure PostgreSQL); sample data if it is not reachable
  useEffect(() => {
    let ignore = false // true if the page closes before the answer arrives
    loadMovies().then((result) => {
      if (ignore) return
      setMovies(result.movies)
      setDataSource(result.source)
    })
    return () => {
      ignore = true
    }
  }, [])

  // Escape closes the top-most overlay
  useEffect(() => {
    const handle = (e) => {
      if (e.key !== 'Escape') return
      if (selected) setSelected(null)
      else if (friendOpen) setFriendOpen(null)
      else if (profileOpen) setProfileOpen(false)
      else if (overlay) setOverlay(null)
      else setFriendsOpen(false)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [selected, friendOpen, profileOpen, overlay])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 2300)
    return () => clearTimeout(t)
  }, [toast])

  const filtered = useMemo(
    () =>
      movies.filter((m) => {
        const matches = (m.title + ' ' + m.genre)
          .toLowerCase()
          .includes(search.toLowerCase())
        const genre = activeGenre === 'All' || m.genre === activeGenre
        return matches && genre
      }),
    [movies, search, activeGenre],
  )
  const visibleIds = useMemo(
    () => new Set(filtered.map((m) => m.id)),
    [filtered],
  )
  const watchlistMovies = movies.filter((m) => watchlist.includes(m.id))
  const paused = Boolean(selected || friendOpen || profileOpen || overlay)

  function rate(movie, value) {
    setMyRatings((r) => ({ ...r, [movie.id]: value }))
    api.sendRating(movie, value)
  }
  function saveReview() {
    if (!review.trim()) return
    api.sendReview(selected, review.trim(), myRatings[selected.id])
    setReview('')
  }
  function toggleWatchlist(id) {
    const saved = watchlist.includes(id)
    setWatchlist((list) =>
      saved ? list.filter((x) => x !== id) : [...list, id],
    )
    setToast(saved ? 'Removed from your watchlist' : 'Saved to your watchlist')
  }
  function switchZone(id) {
    setZone(id)
    setActiveGenre('All')
  }
  // Friday Film Club is both a community and the friend room in the lobby
  function toggleRoom() {
    setJoined(!joined)
    if (!joined && filmClub) api.sendJoin(filmClub)
    else setToast(joined ? 'You left the room' : 'You joined Friday Film Club')
  }
  function toggleCommunity(community) {
    if (community.name === 'Friday Film Club') {
      toggleRoom()
      return
    }
    const member = memberships.has(community.id)
    setMemberships((set) => {
      const next = new Set(set)
      if (member) next.delete(community.id)
      else next.add(community.id)
      return next
    })
    // there is no "leave" endpoint in the plan yet, so leaving stays local
    if (member) setToast('You left ' + community.name)
    else api.sendJoin(community)
  }
  function inviteFriend(friend) {
    setInvited((set) => new Set(set).add(friend.name))
    setToast(friend.name + ' is heading to Friday Film Club')
    setFriendOpen(null)
  }
  function openFromList(movie) {
    setSelected(movie)
  }

  return (
    <div className="mv-shell">
      <MovieVerseWorld
        movies={movies}
        visibleIds={visibleIds}
        zones={zones}
        zone={zone}
        onDistrictChange={setZone}
        name={name}
        avatar={avatar}
        skin={skin}
        friends={friends}
        joined={joined}
        invited={invited}
        watchlistCount={watchlist.length}
        paused={paused}
        onOpenMovie={setSelected}
        onOpenProfile={() => setProfileOpen(true)}
        onToggleRoom={toggleRoom}
        onOpenFriend={setFriendOpen}
        onOpenCommunities={() => setOverlay('communities')}
        onOpenWatchlist={() => setOverlay('watchlist')}
      />

      <MovieVerseHud
        zones={zones}
        zone={zone}
        onZone={switchZone}
        search={search}
        onSearch={setSearch}
        activeGenre={activeGenre}
        onGenre={setActiveGenre}
        onCatalogue={() => setOverlay('catalogue')}
        dataSource={dataSource}
        onFriends={() => setFriendsOpen((v) => !v)}
        friendCount={friends.length}
        name={name}
        avatar={avatar}
        onProfile={() => setProfileOpen(true)}
      />

      {friendsOpen && (
        <MovieVerseFriendsPanel
          friends={friends}
          invited={invited}
          joined={joined}
          onClose={() => setFriendsOpen(false)}
          onInviteLink={() => setToast('Invite link copied (demo)')}
          onOpenFriend={setFriendOpen}
          onToggleRoom={toggleRoom}
        />
      )}

      {overlay === 'catalogue' && (
        <MovieVersePanel
          eyebrow={`CATALOGUE · ${filtered.length} MOVIES`}
          title="All movies"
          wide
          onClose={() => setOverlay(null)}
        >
          <p className="mv-panel-sub">
            The same movies you can walk to in the world. Search and genre
            filters apply here too.
          </p>
          <div className="movie-grid">
            {filtered.map((movie) => (
              <MovieVerseMovieCard
                key={movie.id}
                movie={movie}
                onSelect={openFromList}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              No movies found. Try another search or genre.
            </div>
          )}
        </MovieVersePanel>
      )}

      {overlay === 'watchlist' && (
        <MovieVersePanel
          eyebrow="YOUR WATCHLIST"
          title={`Saved movies (${watchlistMovies.length})`}
          wide
          onClose={() => setOverlay(null)}
        >
          {watchlistMovies.length === 0 ? (
            <div className="empty-state">
              Nothing saved yet. Open a movie and press “Save to watchlist”.
            </div>
          ) : (
            <div className="movie-grid">
              {watchlistMovies.map((movie) => (
                <MovieVerseMovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={openFromList}
                />
              ))}
            </div>
          )}
        </MovieVersePanel>
      )}

      {overlay === 'communities' && (
        <MovieVersePanel
          eyebrow="COMMUNITIES"
          title="Find your people"
          onClose={() => setOverlay(null)}
        >
          <div className="mv-community-list">
            {api.communities.map((c) => {
              const member =
                c.name === 'Friday Film Club' ? joined : memberships.has(c.id)
              return (
                <div className="mv-community" key={c.id}>
                  <div>
                    <b>{c.name}</b>
                    <small>{c.description}</small>
                    <small>{c.members + (member ? 1 : 0)} members</small>
                  </div>
                  <button
                    className={member ? 'joined' : ''}
                    onClick={() => toggleCommunity(c)}
                  >
                    {member ? 'Leave' : 'Join'}
                  </button>
                </div>
              )
            })}
          </div>
        </MovieVersePanel>
      )}

      {friendOpen && (
        <MovieVersePanel
          eyebrow="FRIEND"
          title={friendOpen.name}
          onClose={() => setFriendOpen(null)}
        >
          <div className="mv-friend-card">
            <div className={'friend-avatar ' + friendOpen.color}>
              {friendOpen.initial}
            </div>
            <p>
              {invited.has(friendOpen.name)
                ? 'Hanging out in Friday Film Club'
                : friendOpen.status}
            </p>
          </div>
          <div className="mv-panel-actions">
            <button
              className="primary-button"
              disabled={invited.has(friendOpen.name)}
              onClick={() => inviteFriend(friendOpen)}
            >
              {invited.has(friendOpen.name)
                ? 'Already in Friday Film Club'
                : 'Invite to Friday Film Club'}
            </button>
            <button
              className="mv-secondary-button"
              onClick={() => {
                setToast('You waved at ' + friendOpen.name + ' 👋')
                setFriendOpen(null)
              }}
            >
              Say hi 👋
            </button>
          </div>
        </MovieVersePanel>
      )}

      {selected && (
        <MovieVerseMovieModal
          movie={selected}
          myRating={myRatings[selected.id]}
          inWatchlist={watchlist.includes(selected.id)}
          review={review}
          onReviewChange={setReview}
          onRate={(n) => rate(selected, n)}
          onToggleWatchlist={() => toggleWatchlist(selected.id)}
          onSaveReview={saveReview}
          reviews={api.reviewsFor(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}

      {profileOpen && (
        <MovieVerseProfileModal
          name={name}
          avatar={avatar}
          skin={skin}
          onName={setName}
          onAvatar={setAvatar}
          onSkin={setSkin}
          onSave={() => {
            setProfileOpen(false)
            api.sendProfile()
          }}
          onClose={() => setProfileOpen(false)}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <Sparkles size={15} />
          {toast}
        </div>
      )}
    </div>
  )
}
