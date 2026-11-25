// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import MovieVerseFriendsPanel from '../../src/components/MovieVerseFriendsPanel'
import useFriends from '../../src/hooks/useFriends'

function FriendsDemo() {
  const friends = useFriends(() => {})
  return (
    <MovieVerseFriendsPanel
      friends={friends.list}
      invited={friends.invited}
      onAddFriend={friends.addFriend}
      onRemoveFriend={friends.removeFriend}
    />
  )
}

let container
let root

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  act(() => root.render(<FriendsDemo />))
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

function submitName(value) {
  container.querySelector('input').value = value
  act(() => container.querySelector('button[type="submit"]').click())
}

it('adds and removes a friend starting from an empty list', () => {
  for (const button of container.querySelectorAll('.remove-friend')) {
    act(() => button.click())
  }
  expect(container.textContent).toContain('No friends yet.')
  submitName(' Robin ')
  expect(container.querySelector('h3').textContent).toBe('Friends 01')
  expect(container.textContent).not.toContain('No friends yet.')
  act(() => container.querySelector('[aria-label="Remove Robin"]').click())
  expect(container.textContent).toContain('No friends yet.')
  expect(container.querySelector('h3').textContent).toBe('Friends 00')
})

it('rejects blank names and duplicates regardless of case or surrounding spaces', () => {
  const count = container.querySelector('h3').textContent
  submitName('   ')
  expect(container.querySelector('[role="alert"]').textContent).toBe('Enter a friend name.')
  submitName(' mILA ')
  expect(container.querySelector('[role="alert"]').textContent).toContain('already on your list')
  expect(container.querySelector('h3').textContent).toBe(count)
})
