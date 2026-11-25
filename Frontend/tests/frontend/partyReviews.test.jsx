import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import MovieVersePartyReviews from '../../src/components/MovieVersePartyReviews'

const mila = { name: 'Mila', demoReviews: [{ id: 'a', title: 'Dune', text: 'Wonderful score.' }] }
const submitted = { id: 1, title: 'Inception', text: 'Worth a second watch.' }
const emptyMessage = 'No reviews from party members yet.'

function render(props = {}) {
  return renderToStaticMarkup(
    <MovieVersePartyReviews
      friends={[mila]}
      accepted={new Set()}
      playerName="Robin"
      {...props}
    />,
  )
}

it('displays demo reviews only for accepted friends with sample reviews', () => {
  expect(render()).toContain(emptyMessage)
  const accepted = new Set(['Mila'])
  const markup = render({ accepted })
  expect(markup).toContain('Mila · Demo')
  expect(markup).toContain('Dune')
  expect(markup).toContain('Wonderful score.')
  expect(render({ accepted, friends: [{ name: 'Mila' }] })).toContain(emptyMessage)
})

it('shows a joined member’s actual reviews until they leave the room', () => {
  const userReviews = { status: 'ready', reviews: [submitted] }
  const markup = render({ joined: true, userReviews })
  expect(markup).toContain('Robin (you)')
  expect(markup).toContain('Inception')
  expect(markup).toContain(submitted.text)
  expect(render({ joined: false, userReviews })).not.toContain(submitted.text)
})

it('distinguishes loading and failure from a successful empty result', () => {
  const renderStatus = (status) => render({ joined: true, userReviews: { status, reviews: [] } })
  expect(renderStatus('ready')).toContain(emptyMessage)
  expect(renderStatus('loading')).toContain('Loading your reviews')
  expect(renderStatus('loading')).not.toContain(emptyMessage)
  expect(renderStatus('error')).toContain('Try again')
  expect(renderStatus('error')).not.toContain(emptyMessage)
})
