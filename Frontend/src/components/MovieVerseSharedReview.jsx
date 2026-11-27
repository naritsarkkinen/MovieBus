function ReviewComposer({ movie, feedback }) {
  const draft = feedback.draftFor(movie.id)

  function submit(event) {
    event.preventDefault()
    return feedback.saveReview(movie)
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="shared-review-body">Your review</label>
      <textarea
        id="shared-review-body"
        value={draft}
        maxLength={1500}
        rows={3}
        onChange={(event) => feedback.setDraft(movie.id, event.target.value)}
      />
      <button type="submit" disabled={feedback.reviewPending || !draft.trim()}>
        {feedback.reviewPending ? 'Posting…' : 'Post review'}
      </button>
    </form>
  )
}

function ReviewThread({ thread }) {
  return (
    <div className="shared-review-thread">
      <button type="button" onClick={thread.refresh} disabled={thread.status === 'loading'}>
        Refresh reviews
      </button>
      {thread.status === 'loading' && <p role="status">Loading reviews…</p>}
      {thread.status === 'error' && <p role="status">Couldn’t load the movie’s reviews.</p>}
      {thread.status === 'ready' && thread.reviews.length === 0 && <p>No reviews yet.</p>}
      {thread.reviews.length > 0 && (
        <ul aria-label="Movie reviews">
          {thread.reviews.map((review) => (
            <li key={review.id}>
              <strong>{review.author}</strong>
              <p>{review.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function MovieVerseSharedReview({
  movies, dataSource, movieId, onSelectMovie, signedIn, onSignIn, feedback, thread, onCopyLink,
}) {
  const movie = movies.find((item) => String(item.id) === movieId)
  return (
    <section className="shared-review" aria-label="Review together">
      <h4>Review together</h4>
      {dataSource === 'loading' && <p role="status">Loading movies…</p>}
      {dataSource === 'error' && <p role="status">The movie catalogue is unavailable.</p>}
      {dataSource === 'live' && movies.length === 0 && <p>No movies in the catalogue yet.</p>}
      {movies.length > 0 && (
        <>
          <label htmlFor="shared-review-movie">Movie to review</label>
          <select
            id="shared-review-movie"
            value={movie ? movieId : ''}
            onChange={(event) => onSelectMovie(event.target.value)}
          >
            <option value="">Choose a movie</option>
            {movies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}{item.year ? ' (' + item.year + ')' : ''}
              </option>
            ))}
          </select>
        </>
      )}
      {dataSource === 'live' && movieId && !movie && <p>The selected movie is unavailable.</p>}
      {movie && (
        <>
          <p>Reviews are public on this movie’s page.</p>
          <button type="button" onClick={() => onCopyLink(movieId)}>Copy review link</button>
          {signedIn
            ? <ReviewComposer movie={movie} feedback={feedback} />
            : <button type="button" onClick={onSignIn}>Sign in to post a review</button>}
          <ReviewThread thread={thread} />
        </>
      )}
    </section>
  )
}
