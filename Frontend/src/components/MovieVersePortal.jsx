// One upright dimension portal, standing on its glowing base.
// The look comes from CSS: `portal-hex`, `portal-glitch`, `portal-galaxy` or
// `portal-earth` (see "dimension portals" and "Earth" in MovieVersePage.css).
// The 3 empty <span> layers are animated by CSS (tunnel, dots, swirl, Earth).
export default function MovieVersePortal({ place, current }) {
  const look = 'portal-' + place.portal
  return (
    <>
      {/* the glowing base on the floor: you step onto this */}
      <div
        className={'portal-base ' + look + (current ? ' current' : '')}
        style={{ left: place.x, top: place.y }}
      >
        <span className="walk-place-ring" />
      </div>

      {/* the door itself, standing up (billboard = feet at left / top) */}
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
