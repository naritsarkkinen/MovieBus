import { useMemo, useState } from 'react'
import './MovieVersePage.css'
import { zones } from '../data/MovieVerseData'
import { splitMovies } from '../data/MovieVerseWorldLayout'
import useMovieVerseApi from '../hooks/useMovieVerseApi'
import useToast from '../hooks/useToast'
import useEscapeKey from '../hooks/useEscapeKey'
import useMovieCatalogue from '../hooks/useMovieCatalogue'
import useMovieFilters from '../hooks/useMovieFilters'
import useMovieFeedback from '../hooks/useMovieFeedback'
import useWatchlist from '../hooks/useWatchlist'
import useCommunityMembership from '../hooks/useCommunityMembership'
import useProfileEditor from '../hooks/useProfileEditor'
import useFriends from '../hooks/useFriends'
import useWorldNavigation from '../hooks/useWorldNavigation'
import MovieVerseWorld from '../components/MovieVerseWorld'
import MovieVerseHud from '../components/MovieVerseHud'
import MovieVerseFriendsPanel from '../components/MovieVerseFriendsPanel'
import MovieVersePlaceStack from '../components/MovieVersePlaceStack'
import MovieVerseToast from '../components/MovieVerseToast'
import MovieVersePopups from './MovieVersePopups'

// world underneath, everything else = overlays on top.
// State lives in hooks (src/hooks); the page only connects them.
export default function MovieVersePage() {
  const [toast, notify] = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [catalogueOpen, setCatalogueOpen] = useState(false)

  const profile = useProfileEditor(notify)
  const friends = useFriends(notify)
  const catalogue = useMovieCatalogue({ selectedId, notify })
  const filters = useMovieFilters(catalogue.movies)
  const watchlist = useWatchlist(notify)
  const membership = useCommunityMembership(notify, friends.accepted.size)
  const api = useMovieVerseApi({
    session: profile.session,
    onExpired: profile.expire,
    selectedId: catalogue.live ? selectedId : null,
    notify,
  })
  const feedback = useMovieFeedback({ api, refreshMovie: catalogue.refreshMovie })
  const world = useWorldNavigation({
    onStudio: profile.open,
    onRoom: friends.openPanel,
    onZoneSwitch: () => filters.setActiveGenre('All'),
  })

  const { movies } = catalogue
  const selected = movies.find((movie) => movie.id === selectedId)
  const groups = useMemo(() => splitMovies(movies), [movies])
  const stackMovies = (groups[world.zone] || []).filter((m) => filters.visibleIds.has(m.id))
  const watchlistMovies = movies.filter((m) => watchlist.isSaved(m.id))
  const popupOpen = Boolean(selected || friends.openFriend || profile.draft || catalogueOpen)
  // paused = no walking while something covers the world
  const paused = popupOpen || world.placeOpen
  const { name, avatar, skin } = profile.profile

  // top-most first
  useEscapeKey([
    [selectedId !== null, () => setSelectedId(null)],
    [friends.openFriend, friends.closeFriend],
    [profile.draft, profile.close],
    [catalogueOpen, () => setCatalogueOpen(false)],
    [world.placeOpen, world.closePlace],
    [true, friends.closePanel],
  ])

  function openCard(card) {
    if (card.community) membership.toggleCommunity(card.community)
    else setSelectedId(card.movie.id)
  }

  return (
    <div className={'mv-shell' + (paused ? ' covered' : '')}>
      <MovieVerseWorld
        mapId={world.mapId}
        zone={world.zone}
        onPlaceChange={world.enterPlace}
        name={name}
        avatar={avatar}
        skin={skin}
        friends={friends.list}
        accepted={friends.accepted}
        paused={paused}
        onOpenFriend={friends.showFriend}
      />

      <MovieVerseHud
        zones={zones}
        zone={world.zone}
        onZone={world.switchZone}
        search={filters.search}
        onSearch={filters.setSearch}
        searchResults={filters.filtered}
        onPickMovie={(movie) => setSelectedId(movie.id)}
        activeGenre={filters.activeGenre}
        onGenre={filters.setActiveGenre}
        onCatalogue={() => setCatalogueOpen(true)}
        dataSource={catalogue.dataSource}
        loadError={catalogue.loadError}
        onFriends={friends.togglePanel}
        friendCount={friends.list.length}
        name={name}
        avatar={avatar}
        onProfile={profile.open}
      />

      {friends.panelOpen && (
        <MovieVerseFriendsPanel
          friends={friends.list}
          onAddFriend={friends.addFriend}
          onRemoveFriend={friends.removeFriend}
          invited={friends.invited}
          accepted={friends.accepted}
          declined={friends.declined}
          joined={membership.joined}
          onClose={friends.closePanel}
          onInvite={friends.invite}
          onRespondToInvite={friends.respondToInvite}
          onOpenFriend={friends.showFriend}
          onToggleRoom={membership.toggleRoom}
        />
      )}

      {world.placeOpen && (
        <MovieVersePlaceStack
          zone={world.zone}
          stackMovies={stackMovies}
          watchlistMovies={watchlistMovies}
          communities={catalogue.communities}
          isMember={membership.isMember}
          apiFailed={catalogue.dataSource === 'error'}
          active={!popupOpen}
          onOpen={openCard}
          onClose={world.closePlace}
        />
      )}

      <MovieVersePopups
        catalogueOpen={catalogueOpen}
        onCloseCatalogue={() => setCatalogueOpen(false)}
        catalogue={catalogue}
        filteredMovies={filters.filtered}
        friends={friends}
        selected={selected}
        onSelectMovie={(movie) => setSelectedId(movie.id)}
        onCloseMovie={() => setSelectedId(null)}
        feedback={feedback}
        watchlist={watchlist}
        reviewsFor={api.reviewsFor}
        profile={profile}
      />

      <MovieVerseToast message={toast} />
    </div>
  )
}
