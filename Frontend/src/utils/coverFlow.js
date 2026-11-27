// COVER FLOW: offset 0 = middle card. Side cards: move aside (x),
// go back (z), turn 50° to the middle (rotateY) → like an open book
export function coverFlow(offset) {
  if (offset === 0) return 'translateX(0) translateZ(0) rotateY(0deg)'
  const side = offset < 0 ? -1 : 1 // -1 left, 1 right
  const distance = Math.abs(offset)
  const x = side * (60 + (distance - 1) * 22) // %
  const z = -150 - (distance - 1) * 60 // px, minus = further
  const turn = -side * 50
  return `translateX(${x}%) translateZ(${z}px) rotateY(${turn}deg)`
}
