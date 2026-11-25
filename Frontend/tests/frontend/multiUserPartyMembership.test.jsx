// @vitest-environment happy-dom
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { accounts, button, openPartyClients, signIn } from './helpers/partyClients'

let clients

beforeEach(async () => {
  clients = await openPartyClients()
  await signIn(clients.first, accounts[0])
  await signIn(clients.second, accounts[1])
})

afterEach(() => clients?.close())

function members(client) {
  return [...client.querySelectorAll('[aria-label="Party members"] li')]
    .map((item) => item.textContent.replace(/ \(you\)$/, ''))
}

describe('invitation delivery between two accounts', () => {
  beforeEach(async () => {
    const { first, second } = clients
    const input = first.querySelector('#friend-name')
    input.value = 'Robin'
    await act(async () => button(first, 'Add friend').click())
    await act(async () => first.querySelector('.invite-button').click())
    await act(async () => first.querySelector('[aria-label="Invite Robin to Friday Film Club"]').click())
    expect(first.querySelector('.friend-list').textContent).toContain('Invitation pending')
    await act(async () => second.querySelector('.invite-button').click())
  })

  // Invitations currently live in the sender's useFriends hook.
  it.fails('offers Robin the invitation sent by Leena in the other client', () => {
    const controls = [...clients.second.querySelectorAll('.friends-panel button')].map((item) => item.textContent.trim())
    expect(controls).toEqual(expect.arrayContaining([
      expect.stringMatching(/^(accept(?: invitation)?|view invitation as Robin)$/i),
    ]))
  })
})

describe('party roster shared by two accounts', () => {
  beforeEach(async () => {
    const { first, second } = clients
    await act(async () => button(first, 'Join').click())
    await act(async () => button(second, 'Join').click())
    expect(members(first)).toContain('Leena')
    expect(members(second)).toContain('Robin')
  })

  // Friday Film Club currently tracks membership in each client's React state.
  it.fails('shows both joined players in both clients', () => {
    const bothPlayers = expect.arrayContaining(['Leena', 'Robin'])
    expect([members(clients.first), members(clients.second)]).toEqual([bothPlayers, bothPlayers])
  })
})
