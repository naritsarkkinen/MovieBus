import { communityCard, movieCard } from './MovieVerseCards'

export const EMPTY_WATCHLIST =
  'Nothing saved yet. Open a movie and press “Save to watchlist”.'

export const STACK_TITLES = {
  trending: 'Trending dimension',
  discover: 'Discover dimension',
  community: 'Community dimension',
  watchlist: 'Your watchlist',
  communities: 'Communities',
}

// cards shown in the cover-flow stack of the place you walked into
export function placeCards({ zone, stackMovies, watchlistMovies, communities, isMember }) {
  if (zone === 'watchlist') return watchlistMovies.map(movieCard)
  if (zone === 'communities') {
    return communities.map((c) => communityCard(c, isMember(c)))
  }
  return stackMovies.map(movieCard)
}

export function placeEmptyText(zone, apiFailed) {
  if (zone === 'watchlist') return EMPTY_WATCHLIST
  if (zone === 'communities') return 'No communities yet.'
  if (apiFailed) {
    return 'Could not load movies from the API. Check that the backend is running.'
  }
  return 'No movies here. Try another search or genre.'
}
