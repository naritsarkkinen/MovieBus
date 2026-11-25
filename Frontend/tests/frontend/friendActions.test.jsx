// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import MovieVerseFriendsPanel from '../../src/components/MovieVerseFriendsPanel'
import useFriends from '../../src/hooks/useFriends'
import useCommunityMembership from '../../src/hooks/useCommunityMembership'

function FriendsDemo() {
  const friends = useFriends(() => {})
  const membership = useCommunityMembership(() => {}, friends.accepted.size)
  return (
    <MovieVerseFriendsPanel
      friends={friends.list}
      invited={friends.invited}
      accepted={friends.accepted}
      declined={friends.declined}
      playerName="Robin"
      joined={membership.joined}
      onToggleRoom={membership.toggleRoom}
      onInvite={friends.invite}
      onRespondToInvite={friends.respondToInvite}
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

function partyMembers() {
  const rows = container.querySelectorAll('ul[aria-label="Party members"] li')
  return [...rows].map((row) => row.textContent.trim())
}

it('sends a party invitation once and leaves room occupancy unchanged', () => {
  const occupancy = container.querySelector('.room-card small').textContent
  act(() => container.querySelector('.invite-button').click())
  const send = container.querySelector('[aria-label="Invite Mila to Friday Film Club"]')
  act(() => send.click())
  expect(send.disabled).toBe(true)
  expect(send.textContent).toBe('Invitation sent')
  expect(container.querySelector('.friend-list').textContent).toContain('Invitation pending')
  expect(container.querySelector('.room-card small').textContent).toBe(occupancy)
  expect(partyMembers()).toHaveLength(2)
  expect(partyMembers()).not.toContain('Mila')
  expect(container.querySelector('[aria-label="Invite Alex to Friday Film Club"]').disabled).toBe(false)
})

function recipientButton() {
  return [...container.querySelectorAll('button')]
    .find((button) => button.textContent === 'View invitation as Mila')
}

function inviteMilaAndRespond(response) {
  act(() => container.querySelector('.invite-button').click())
  act(() => container.querySelector('[aria-label="Invite Mila to Friday Film Club"]').click())
  act(() => recipientButton().click())
  const responseButton = [...container.querySelectorAll('button')]
    .find((button) => button.textContent.trim() === response)
  act(() => responseButton.click())
}

it('adds the recipient to the room when she accepts and prevents a second invitation', () => {
  inviteMilaAndRespond('Accept')
  expect(container.querySelector('.room-card small').textContent).toBe('3 / 6 explorers inside')
  expect(container.querySelector('[aria-label="Invite Mila to Friday Film Club"]').disabled).toBe(true)
  expect(recipientButton()).toBeUndefined()
  expect(partyMembers()).toHaveLength(3)
  expect(partyMembers()).toContain('Mila')

  act(() => container.querySelector('[aria-label="Remove Mila"]').click())
  expect(partyMembers()).toHaveLength(2)
  expect(partyMembers()).not.toContain('Mila')
  expect(container.querySelector('.room-card small').textContent).toBe('2 / 6 explorers inside')
})

it('keeps room occupancy unchanged after declining and lets the sender invite again', () => {
  inviteMilaAndRespond('Decline')
  expect(container.querySelector('.room-card small').textContent).toBe('2 / 6 explorers inside')
  expect(partyMembers()).toHaveLength(2)
  expect(partyMembers()).not.toContain('Mila')
  expect(recipientButton()).toBeUndefined()
  const send = container.querySelector('[aria-label="Invite Mila to Friday Film Club"]')
  expect(send.disabled).toBe(false)
  act(() => send.click())
  expect(recipientButton()).toBeDefined()
})

it('shows the current player in the lobby for as long as they are in the room', () => {
  const initialMembers = partyMembers()
  expect(initialMembers).toHaveLength(2)
  expect(initialMembers).not.toContain('Robin (you)')

  const toggleRoom = container.querySelector('.room-card button')
  act(() => toggleRoom.click())
  expect(partyMembers()).toContain('Robin (you)')
  expect(partyMembers()).toHaveLength(3)
  expect(container.querySelector('.room-card small').textContent).toBe('3 / 6 explorers inside')

  act(() => toggleRoom.click())
  expect(partyMembers()).toEqual(initialMembers)
  expect(container.querySelector('.room-card small').textContent).toBe('2 / 6 explorers inside')
})

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
