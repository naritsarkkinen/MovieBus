// look = CSS class (portal-hex, -glitch...), the 3 spans = CSS animations
export default function MovieVersePortal({ place, current }) {
  const look = 'portal-' + place.portal
  return (
    <>
      <div
        className={'portal-base ' + look + (current ? ' current' : '')}
        style={{ left: place.x, top: place.y }}
      >
        <span className="walk-place-ring" />
      </div>

      <div
        className={'billboard portal ' + look}
        style={{ left: place.x, top: place.y - 10, zIndex: place.y }}
      >
        <div className="portal-door">
          <span />
          <span />
          <span />
        </div>
        <b className="portal-label">
          {place.icon} {place.label}
        </b>
      </div>
    </>
  )
}
