// Keeps an index inside a list: never below 0, never past the last item.
// Example: clampIndex(7, 5) = 4, clampIndex(-1, 5) = 0
export function clampIndex(index, length) {
  return Math.max(0, Math.min(index, length - 1))
}
