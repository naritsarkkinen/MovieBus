import MovieVerseCardStack from './MovieVerseCardStack'
import { STACK_TITLES, placeCards, placeEmptyText } from '../data/MovieVersePlaces'

// cover-flow cards of the place you walked into (trending, watchlist, ...)
export default function MovieVersePlaceStack({
  zone,
  stackMovies,
  watchlistMovies,
  communities,
  isMember,
  apiFailed,
  active,
  onOpen,
  onClose,
}) {
  return (
    <MovieVerseCardStack
      key={zone}
      title={STACK_TITLES[zone]}
      theme={zone}
      cards={placeCards({ zone, stackMovies, watchlistMovies, communities, isMember })}
      emptyText={placeEmptyText(zone, apiFailed)}
      active={active}
      onOpen={onOpen}
      onClose={onClose}
    />
  )
}
