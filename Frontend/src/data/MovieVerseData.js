export const zones = [
  {
    id: 'trending',
    name: 'Trending Universe',
    sub: 'The movies everyone is talking about',
    icon: '✦',
    genre: 'All',
  },
  {
    id: 'discover',
    name: 'Discover Universe',
    sub: 'Find your next favourite story',
    icon: '◈',
    genre: 'Discover',
  },
  {
    id: 'community',
    name: 'Community Universe',
    sub: 'Picks from people in your orbit',
    icon: '◎',
    genre: 'Community',
  },
  {
    id: 'clubs',
    name: 'Clubs & you',
    sub: 'Communities, your watchlist and your avatar',
    icon: '♥',
  },
]
export const ROOM_CAPACITY = 6
export const roomGuests = ['Guest 1', 'Guest 2']

export function roomOccupancy(acceptedCount, joined) {
  return roomGuests.length + acceptedCount + (joined ? 1 : 0)
}

// fake friends: no backend endpoint yet
export const friends = [
  {
    name: 'Mila',
    status: 'Exploring Sci-Fi',
    initial: 'M',
    color: 'lavender',
    demoReviews: [{
      id: 'dune-2',
      title: 'Dune: Part Two',
      text: 'The first sandworm ride made the whole desert feel alive.',
    }],
  },
  { name: 'Alex', status: 'In the lobby', initial: 'A', color: 'mint' },
  {
    name: 'Noah',
    status: 'Watching the trending list',
    initial: 'N',
    color: 'peach',
  },
]
