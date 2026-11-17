// Keyboard help (desktop) and arrow buttons (phones).
// CSS decides which one is visible. Holding an arrow button works like
// holding the key: onPress when the finger goes down, onRelease when it leaves.
const ARROWS = [
  ['up', '▲'],
  ['left', '◀'],
  ['down', '▼'],
  ['right', '▶'],
]

export default function MovieVerseControls({ onPress, onRelease }) {
  return (
    <>
      <div className="walk-help">
        <b>MOVE AROUND</b>
        <span>
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> walk · <kbd>Shift</kbd> run
        </span>
        <span>
          <kbd>F</kbd> / <kbd>Enter</kbd> use · or click
        </span>
        <span>or click the floor to walk there</span>
      </div>

      <div className="walk-pad-controls">
        {ARROWS.map(([direction, icon]) => (
          <button
            key={direction}
            aria-label={direction}
            className={'pad-' + direction}
            onPointerDown={(e) => {
              e.stopPropagation() // do not also "walk to the click"
              onPress(direction)
            }}
            onPointerUp={() => onRelease(direction)}
            onPointerLeave={() => onRelease(direction)}
            onPointerCancel={() => onRelease(direction)}
          >
            {icon}
          </button>
        ))}
      </div>
    </>
  )
}
