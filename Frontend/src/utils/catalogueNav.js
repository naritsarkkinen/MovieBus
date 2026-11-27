import { clampIndex } from './clampIndex'

// catalogue grid: row 0 = All movies (whole line), then genres `perLine` per line
// move = 'left' | 'right' | 'up' | 'down' → index of the next genre
export function nextGenre(current, move, perLine, count) {
  let next = current
  if (move === 'left') next = current - 1
  if (move === 'right') next = current + 1
  if (move === 'up') next = current <= perLine ? 0 : current - perLine
  if (move === 'down') next = current === 0 ? 1 : current + perLine
  return clampIndex(next, count)
}
