import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { loadXpLeaderboard } from '../api/xpLeaderboard'
import '../styles/xp-leaderboard.css'

function Scores({ rows }) {
  if (!rows.length) return <p>No XP scores yet.</p>
  return (
    <table aria-label="XP leaderboard">
      <thead>
        <tr>
          <th scope="col">Rank</th>
          <th scope="col">Explorer</th>
          <th scope="col">XP</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} data-rank={row.rank}>
            <td>{row.rank}</td>
            <th scope="row">{row.name}</th>
            <td>{row.xp.toLocaleString('en-US')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LeaderboardResults() {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    loadXpLeaderboard().then(
      (data) => { if (active) setResult(data) },
      () => { if (active) setResult({ failed: true }) },
    )
    return () => { active = false }
  }, [attempt])

  function retry() {
    setResult(null)
    setAttempt((n) => n + 1)
  }

  if (!result) return <p role="status">Loading scores…</p>
  if (result.failed) {
    return (
      <>
        <p role="alert">Couldn’t load XP scores.</p>
        <button type="button" className="mv-secondary-button" onClick={retry}>Try again</button>
      </>
    )
  }
  return (
    <>
      {result.source === 'demo' && <p>Demo scores</p>}
      <Scores rows={result.rows} />
    </>
  )
}

export default function MovieVerseXpLeaderboard({ onClose }) {
  const dialogRef = useRef(null)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const opener = document.activeElement
    dialog.showModal()
    dialog.querySelector('button').focus()
    return () => {
      dialog.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])

  return (
    <dialog
      className="xp-leaderboard"
      ref={dialogRef}
      aria-labelledby="xp-leaderboard-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="xp-leaderboard-content">
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>
        <h2 id="xp-leaderboard-title">XP leaderboard</h2>
        <LeaderboardResults />
      </div>
    </dialog>
  )
}
