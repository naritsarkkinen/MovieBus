import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import MovieVerseFriendsPanel from '../../src/components/MovieVerseFriendsPanel'

function renderPanel(friends) {
  return renderToStaticMarkup(
    <MovieVerseFriendsPanel friends={friends} invited={new Set()} />,
  )
}

describe('MovieVerseFriendsPanel', () => {
  it('shows the empty message when there are no friends', () => {
    expect(renderPanel([])).toContain('No friends yet.')
  })

  it('shows the friend and hides the empty message when the list has a friend', () => {
    const markup = renderPanel([
      { name: 'Robin', initial: 'R', color: 'purple', status: 'Online' },
    ])
    expect(markup).toContain('Robin')
    expect(markup).not.toContain('No friends yet.')
  })
})
