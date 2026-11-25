// @vitest-environment happy-dom
import { act } from 'react'
import { expect, it } from 'vitest'
import { accounts, button, joinAndSignIn, openPartyClients } from './helpers/partyClients'

async function postReview(container, body) {
  const textarea = container.querySelector('textarea')
  act(() => {
    const value = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
    value.set.call(textarea, body)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await act(async () => button(container, 'Post review').click())
}

function visibleReviews(container) {
  return [...container.querySelectorAll('[aria-label="Movie reviews"] li')]
    .map((item) => [item.querySelector('strong').textContent, item.querySelector('p').textContent])
}

it('lets two signed-in club sessions post and read each other’s reviews on the shared movie', async () => {
  const { first, second, close } = await openPartyClients()
  try {
    await joinAndSignIn(first, accounts[0])
    await joinAndSignIn(second, accounts[1])
    const firstReview = ['Leena', 'The score stayed with me.']
    const secondReview = ['Robin', 'I loved the final scene.']

    await postReview(first, firstReview[1])
    await act(async () => button(second, 'Refresh reviews').click())
    expect(visibleReviews(second)).toEqual([firstReview])

    await postReview(second, secondReview[1])
    await act(async () => button(first, 'Refresh reviews').click())
    expect(visibleReviews(first)).toEqual([secondReview, firstReview])
    expect(visibleReviews(second)).toEqual([secondReview, firstReview])
  } finally {
    close()
  }
})
