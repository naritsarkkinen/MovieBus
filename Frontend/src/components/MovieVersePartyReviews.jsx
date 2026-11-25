function ReviewItem({ review, byline }) {
  return (
    <li>
      <strong>{review.title}</strong>
      <span>{byline}</span>
      <p>{review.text}</p>
    </li>
  )
}

export default function MovieVersePartyReviews({
  friends, accepted, joined, playerName, userReviews = { status: 'idle', reviews: [] },
}) {
  const status = joined ? userReviews.status : 'idle'
  const entries = status === 'ready'
    ? userReviews.reviews.map((review) => (
      <ReviewItem key={'account-' + review.id} review={review} byline={playerName + ' (you)'} />
    ))
    : []

  for (const friend of friends) {
    if (!accepted.has(friend.name)) continue
    for (const review of friend.demoReviews ?? []) {
      entries.push(
        <ReviewItem key={'demo-' + friend.name + '-' + review.id} review={review} byline={friend.name + ' · Demo'} />,
      )
    }
  }

  return (
    <section className="party-reviews" aria-label="Party reviews">
      <h4>Party reviews</h4>
      {entries.length > 0 && <ul>{entries}</ul>}
      {status === 'loading' && <p role="status">Loading your reviews…</p>}
      {status === 'error' && (
        <div>
          <p role="status">Couldn’t load your reviews.</p>
          <button type="button" onClick={userReviews.retry}>Try again</button>
        </div>
      )}
      {entries.length === 0 && (status === 'idle' || status === 'ready') && (
        <p>No reviews from party members yet.</p>
      )}
    </section>
  )
}
