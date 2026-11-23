import { Film, LayoutGrid, Users } from 'lucide-react'
import MovieVerseGenreFilter from './MovieVerseGenreFilter'
import MovieVerseSearch from './MovieVerseSearch'

export default function MovieVerseHud({
  zones,
  zone,
  onZone,
  search,
  onSearch,
  searchResults,
  onPickMovie,
  activeGenre,
  onGenre,
  onCatalogue,
  dataSource,
  loadError,
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
        <MovieVerseSearch
          search={search}
          onSearch={onSearch}
          results={searchResults}
          onPick={onPickMovie}
          onSeeAll={onCatalogue}
        />
        <MovieVerseGenreFilter activeGenre={activeGenre} onSelect={onGenre} />
      </div>

      <div className="mv-hud-right">
        <span
          className={'mv-data-badge ' + dataSource}
          title={
            dataSource === 'live'
              ? 'Movies are loaded from the MovieVerse API'
              : dataSource === 'loading'
                ? 'Loading movies'
                : 'Could not reach the MovieVerse API: ' + loadError
          }
        >
          <i />
          {dataSource === 'live'
            ? 'Live data'
            : dataSource === 'loading'
              ? 'Loading…'
              : 'Offline'}
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
