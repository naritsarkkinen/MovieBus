// @vitest-environment happy-dom
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import MovieVerseSharedReview from '../../src/components/MovieVerseSharedReview'
import useMovieFeedback from '../../src/hooks/useMovieFeedback'

const movies = [{ id: 5, title: 'Arrival' }, { id: 8, title: 'Moon' }]
const firstReview = { id: 20, author: 'Mila', text: 'Great ending.' }
const secondReview = { id: 21, author: 'Noah', text: 'Loved the score.' }

function SharedReviewHarness({ signedIn, onSignIn, sendReview }) {
  const [movieId, selectMovie] = useState('5')
  const [threads, setThreads] = useState({ 5: [firstReview], 8: [secondReview] })
  const feedback = useMovieFeedback({
    api: {
      async sendReview(movie, text) {
        const review = await sendReview(movie, text)
        if (review) {
          setThreads((current) => ({ ...current, [movie.id]: [review, ...current[movie.id]] }))
        }
        return review
      },
    },
  })
  return (
    <MovieVerseSharedReview
      movies={movies}
      dataSource="live"
      movieId={movieId}
      onSelectMovie={selectMovie}
      signedIn={signedIn}
      onSignIn={onSignIn}
      feedback={feedback}
      thread={{ status: 'ready', reviews: threads[movieId], refresh: vi.fn() }}
      onCopyLink={vi.fn()}
    />
  )
}

let root
let container

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

function selectMovie(id) {
  const select = container.querySelector('select')
  act(() => {
    select.value = id
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

function typeReview(text) {
  const textarea = container.querySelector('textarea')
  const value = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
  act(() => {
    value.set.call(textarea, text)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function buttonNamed(pattern) {
  return [...container.querySelectorAll('button')].find((button) => pattern.test(button.textContent))
}

it('keeps drafts and published reviews with the selected movie', async () => {
  const sendReview = vi.fn(async (_movie, text) => ({ id: 22, author: 'Robin', text }))
  act(() => root.render(<SharedReviewHarness signedIn sendReview={sendReview} />))
  expect(container.textContent).toContain(firstReview.text)
  typeReview('Work in progress')

  selectMovie('8')
  expect(container.textContent).toContain(secondReview.text)
  expect(container.textContent).not.toContain(firstReview.text)
  expect(container.querySelector('textarea').value).toBe('')
  typeReview('  A thoughtful film.  ')
  await act(async () => buttonNamed(/post review/i).click())
  expect(sendReview).toHaveBeenCalledWith(movies[1], 'A thoughtful film.')
  expect(container.textContent).toContain('A thoughtful film.')
  expect(container.textContent).toContain('Robin')
  expect(container.querySelector('textarea').value).toBe('')

  selectMovie('5')
  expect(container.textContent).not.toContain('A thoughtful film.')
  expect(container.querySelector('textarea').value).toBe('Work in progress')
})

it('lets a guest read the thread and open sign-in before posting', () => {
  const onSignIn = vi.fn()
  const sendReview = vi.fn()
  act(() => root.render(<SharedReviewHarness signedIn={false} onSignIn={onSignIn} sendReview={sendReview} />))
  expect(container.textContent).toContain(firstReview.text)
  expect(container.querySelector('textarea')).toBeNull()
  act(() => buttonNamed(/sign in/i).click())
  expect(onSignIn).toHaveBeenCalledOnce()
  expect(sendReview).not.toHaveBeenCalled()
})
