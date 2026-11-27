import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import './MovieVersePage.css'
import { fetchMovie, loadMovies } from '../api/movies'
import { fetchCommunities } from '../api/communities'
import { authenticate } from '../api/users'
import { zones, friends } from '../data/MovieVerseData'
import useMovieVerseApi from '../hooks/useMovieVerseApi'
import MovieVerseMovieCard from '../components/MovieVerseMovieCard'
import MovieVerseWorld from '../components/MovieVerseWorld'
import MovieVerseHud from '../components/MovieVerseHud'
import MovieVersePanel from '../components/MovieVersePanel'
import MovieVerseFriendsPanel from '../components/MovieVerseFriendsPanel'
import MovieVerseMovieModal from '../components/MovieVerseMovieModal'
import MovieVerseProfileModal from '../components/MovieVerseProfileModal'
import AdminDashboard from './AdminDashboard'
import MovieVerseCardStack from '../components/MovieVerseCardStack'
import { splitMovies } from '../data/MovieVerseWorldLayout'
import { communityCard, movieCard } from '../data/MovieVerseCards'

const STACK_TITLES = {
  trending: 'Trending dimension',
  discover: 'Discover dimension',
  community: 'Community dimension',
  watchlist: 'Your watchlist',
  communities: 'Communities',
}

// world underneath, everything else = overlays on top
// eslint-disable-next-line max-lines-per-function
export default function MovieVersePage() {
  const [movies, setMovies] = useState([])
  const [dataSource, setDataSource] = useState('loading') // loading | live | error
  const [loadError, setLoadError] = useState('')
  const [communities, setCommunities] = useState([])
  const [zone, setZone] = useState('trending')
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')

  const [session, setSession] = useState(null)
  const profile = session?.profile ?? { name: 'Hämi', skin: 'violet', avatar: '🧑🏽‍🚀' }

  const { name, avatar, skin } = profile

  const [selectedId, setSelectedId] = useState(null)
  const selected = movies.find((movie) => movie.id === selectedId)
  const [profileDraft, setProfileDraft] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [profilePending, setProfilePending] = useState(false)
  const [friendOpen, setFriendOpen] = useState(null)
  const [overlay, setOverlay] = useState(null) // catalogue | communities | watchlist
  const [mapId, setMapId] = useState('hub')
  const [placeOpen, setPlaceOpen] = useState(false)
  const [friendsOpen, setFriendsOpen] = useState(false)

  const [myRatings, setMyRatings] = useState({})
  const [ratingPending, setRatingPending] = useState(false)
  const [reviewDrafts, setReviewDrafts] = useState({})
  const [reviewPending, setReviewPending] = useState(false)
  const [watchlist, setWatchlist] = useState([])
  const [joined, setJoined] = useState(false)
  const [memberships, setMemberships] = useState(() => new Set())
  const [invited, setInvited] = useState(() => new Set())
  const [toast, setToast] = useState('')

  const live = dataSource === 'live'
  const api = useMovieVerseApi({
    session,
    onExpired: () => setSession(null),
    selectedId: live ? selectedId : null,
    notify: setToast,
  })

  // after rating: get new average, swap the movie in the list
  function refreshMovie(id) {
    return fetchMovie(id)
      .then((latest) =>
        setMovies((list) =>
          list.map((movie) => (movie.id === id ? latest : movie)),
        ),
      )
      .catch((error) =>
        setToast('Could not refresh movie details: ' + error.message),
      )
  }

  useEffect(() => {
    if (!live || selectedId === null) return
    fetchMovie(selectedId)
      .then((latest) =>
        setMovies((list) =>
          list.map((movie) => (movie.id === selectedId ? latest : movie)),
        ),
      )
      .catch((error) =>
        setToast('Could not load movie details: ' + error.message),
      )
  }, [live, selectedId])

  useEffect(() => {
    let ignore = false // page closed → ignore late answer
    loadMovies().then((result) => {
      if (ignore) return
      setMovies(result.movies)
      setDataSource(result.source)
      setLoadError(result.error || '')
      if (result.error) setToast('Could not load movies: ' + result.error)
    })
    fetchCommunities()
      .then((list) => {
        if (!ignore) setCommunities(list)
      })
      .catch((error) => {
        if (!ignore) console.warn('Could not load communities:', error.message)
      })
    return () => {
      ignore = true
    }
  }, [])

  // Escape closes the top-most overlay first
  useEffect(() => {
    const handle = (e) => {
      if (e.key !== 'Escape') return
      if (selectedId !== null) setSelectedId(null)
      else if (friendOpen) setFriendOpen(null)
      else if (profileDraft) {
        if (!profilePending) setProfileDraft(null)
      } else if (overlay) setOverlay(null)
      else if (placeOpen) setPlaceOpen(false)
      else setFriendsOpen(false)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [selectedId, friendOpen, profileDraft, profilePending, overlay, placeOpen])

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
  // useMemo = recalculate only when movies change
  const groups = useMemo(() => splitMovies(movies), [movies])
  const stackMovies = (groups[zone] || []).filter((m) => visibleIds.has(m.id))
  const watchlistMovies = movies.filter((m) => watchlist.includes(m.id))
  const popupOpen = Boolean(selected || friendOpen || profileDraft || overlay || adminOpen)
  // paused = no walking while something covers the world
  const paused = popupOpen || placeOpen

  const isMember = (c) =>
    c.name === 'Friday Film Club' ? joined : memberships.has(c.id)
  let placeCards = stackMovies.map(movieCard)
  if (zone === 'watchlist') placeCards = watchlistMovies.map(movieCard)
  if (zone === 'communities') {
    placeCards = communities.map((c) => communityCard(c, isMember(c)))
  }
  const review = reviewDrafts[selectedId] || ''

  async function rate(movie, value) {
    if (ratingPending) return
    setRatingPending(true)
    try {
      const score = await api.sendRating(movie, value)
      if (score === null) return
      setMyRatings((ratings) => ({ ...ratings, [movie.id]: score }))
      await refreshMovie(movie.id)
    } finally {
      setRatingPending(false)
    }
  }
  async function saveReview() {
    const body = review.trim()
    if (!body || reviewPending) return
    const id = selected.id
    setReviewPending(true)
    try {
      const posted = await api.sendReview(selected, body)
      if (posted) {
        setReviewDrafts((drafts) =>
          drafts[id] === review ? { ...drafts, [id]: '' } : drafts,
        )
      }
    } finally {
      setReviewPending(false)
    }
  }
  async function saveProfile() {
    if (profilePending) return
    setProfilePending(true)
    try {
      const saved = await api.sendProfile(profileDraft)
      if (saved) {
        setSession({ ...session, profile: saved })
        setProfileDraft(null)
      }
    } finally {
      setProfilePending(false)
    }
  }
  function toggleWatchlist(id) {
    const saved = watchlist.includes(id)
    setWatchlist((list) =>
      saved ? list.filter((x) => x !== id) : [...list, id],
    )
    setToast(saved ? 'Removed from your watchlist' : 'Saved to your watchlist')
  }
  function goToMap(id) {
    setMapId(id)
    setZone(id)
  }

  // called by the world: id = place you stepped on (null = off)
  function enterPlace(id) {
    if (!id) return
    if (id === 'clubs' || id === 'hub') {
      goToMap(id)
    } else if (id === 'studio') {
      setProfileDraft(profile)
    } else if (id === 'room') {
      setFriendsOpen(true)
    } else {
      setZone(id)
      setPlaceOpen(true)
    }
  }
  function switchZone(id) {
    setActiveGenre('All')
    setPlaceOpen(false)
    if (id === 'clubs') {
      goToMap('clubs')
      return
    }
    setMapId('hub')
    setZone(id)
    setPlaceOpen(true)
  }
  function openCard(card) {
    if (card.community) toggleCommunity(card.community)
    else openFromList(card.movie)
  }
  // Friday Film Club = community AND friend room
  function toggleRoom() {
    setJoined(!joined)
    setToast(
      joined
        ? 'You left the room (demo)'
        : 'You joined Friday Film Club (demo)',
    )
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
    setToast(
      (member ? 'You left ' : 'You joined ') + community.name + ' (demo)',
    )
  }
  function inviteFriend(friend) {
    setInvited((set) => new Set(set).add(friend.name))
    setToast(friend.name + ' is heading to Friday Film Club')
    setFriendOpen(null)
  }
  function openFromList(movie) {
    setSelectedId(movie.id)
  }

  return (
    <div className={'mv-shell' + (paused ? ' covered' : '')}>
      <MovieVerseWorld
        mapId={mapId}
        zone={zone}
        onPlaceChange={enterPlace}
        name={name}
        avatar={avatar}
        skin={skin}
        friends={friends}
        invited={invited}
        paused={paused}
        onOpenFriend={setFriendOpen}
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
        loadError={loadError}
        onFriends={() => setFriendsOpen((v) => !v)}
        friendCount={friends.length}
        name={name}
        avatar={avatar}
        onProfile={() => setProfileDraft(profile)}
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

      {placeOpen && (
        <MovieVerseCardStack
          key={zone}
          title={STACK_TITLES[zone]}
          theme={zone}
          cards={placeCards}
          emptyText={
            zone === 'watchlist'
              ? 'Nothing saved yet. Open a movie and press “Save to watchlist”.'
              : zone === 'communities'
                ? 'No communities yet.'
                : dataSource === 'error'
                  ? 'Could not load movies from the API. Check that the backend is running.'
                  : 'No movies here. Try another search or genre.'
          }
          active={!popupOpen}
          onOpen={openCard}
          onClose={() => setPlaceOpen(false)}
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
              {dataSource === 'error'
                ? 'Could not load movies from the API. Check that the backend is running.'
                : 'No movies found. Try another search or genre.'}
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
            {communities.map((c) => {
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
          onReviewChange={(value) =>
            setReviewDrafts((drafts) => ({
              ...drafts,
              [selected.id]: value,
            }))
          }
          onRate={(n) => rate(selected, n)}
          onToggleWatchlist={() => toggleWatchlist(selected.id)}
          onSaveReview={saveReview}
          ratingPending={ratingPending}
          reviewPending={reviewPending}
          reviews={api.reviewsFor(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {profileDraft && (
        <MovieVerseProfileModal
          {...profileDraft}
          signedIn={Boolean(session)}
          onOpenAdmin={() => {
  setProfileDraft(null)
  setAdminOpen(true)
}}
          onAuthenticate={async (mode, credentials) => {
            setProfilePending(true)
            try {
              const account = await authenticate(mode, credentials)
              setSession(account)
              setProfileDraft(account.profile)
            } finally {
              setProfilePending(false)
            }
          }}
          onName={(value) =>
            setProfileDraft((draft) => ({ ...draft, name: value }))
          }
          onAvatar={(value) =>
            setProfileDraft((draft) => ({ ...draft, avatar: value }))
          }
          onSkin={(value) =>
            setProfileDraft((draft) => ({ ...draft, skin: value }))
          }
          onSave={saveProfile}
          pending={profilePending}
          onClose={() => {
            if (!profilePending) setProfileDraft(null)
          }}
        />
      )}
      {adminOpen && (
        <AdminDashboard
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
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
