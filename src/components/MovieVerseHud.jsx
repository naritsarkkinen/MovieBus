import { Film, LayoutGrid, Search, Users } from 'lucide-react'
import MovieVerseGenreFilter from './MovieVerseGenreFilter'

// The thin bar on top of the world: logo, zones, search, catalogue, profile.
export default function MovieVerseHud({
  zones,
  zone,
  onZone,
  search,
  onSearch,
  activeGenre,
  onGenre,
  onCatalogue,
  dataSource,
  onFriends,
  friendCount,
  name,
  avatar,
  onProfile,
}) {
  return (
    <header className="mv-hud">
      <div className="mv-hud-left">
        <div className="brand">
          <div className="brand-mark">
            <Film size={18} />
          </div>
          <span>
            MOVIE<span className="brand-accent">VERSE</span>
          </span>
        </div>
        <nav className="mv-hud-zones" aria-label="Discovery zones">
          {zones.map((z) => (
            <button
              key={z.id}
              className={zone === z.id ? 'selected' : ''}
              onClick={() => onZone(z.id)}
            >
              <span>{z.icon}</span> {z.name.replace(' Universe', '')}
            </button>
          ))}
        </nav>
      </div>

      <div className="mv-hud-center">
        <div className="search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search movies, genres..."
            aria-label="Search movies"
          />
        </div>
        <MovieVerseGenreFilter activeGenre={activeGenre} onSelect={onGenre} />
      </div>

      <div className="mv-hud-right">
        <span
          className={'mv-data-badge ' + dataSource}
          title={
            dataSource === 'live'
              ? 'Movies are loaded from the MovieBus API'
              : 'API not reachable: showing sample movies'
          }
        >
          <i />
          {dataSource === 'live'
            ? 'Live data'
            : dataSource === 'loading'
              ? 'Loading…'
              : 'Sample data'}
        </span>
        <button className="mv-hud-button" onClick={onCatalogue}>
          <LayoutGrid size={16} /> Catalogue
        </button>
        <button
          className="icon-button"
          onClick={onFriends}
          aria-label="Friends"
        >
          <Users size={18} />
          <span className="tiny-count">{friendCount}</span>
        </button>
        <button className="user-chip" onClick={onProfile}>
          <span>{avatar}</span>
          {name}
        </button>
      </div>
    </header>
  )
}
