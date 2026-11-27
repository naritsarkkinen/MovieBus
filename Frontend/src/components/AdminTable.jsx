
import { useState } from "react";
import {
  AlertCircle, CheckCircle2, LoaderCircle,
  Search, Star, Trash2, X
} from "lucide-react";

export default function AdminTable({
  reviews = [],
  setReviews,
  search = "",
  setSearch,
  loading = false,
  error = null,
  onRetry,
}) {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  const query = search.trim().toLowerCase();
  const filtered = reviews.filter((review) =>
    [review.name, review.movie, review.detail].some((value) =>
      String(value ?? "").toLowerCase().includes(query)
    )
  );

  function deleteReview() {
    if (!selected) return;

    setReviews((current) =>
      current.filter((review) => review.id !== selected.id)
    );

    setMessage(`Review by ${selected.name} deleted successfully.`);
    setSelected(null);
  }

  return (
    <section className="adm-panel">
      <div className="adm-panel-head">
        <div>
          <p className="adm-caption">MOVIEBUS / MODERATION</p>
          <h2>All Reviews</h2>
          <p>Manage reviews written by MovieBus users.</p>
        </div>

        <label className="adm-review-search">
          <Search size={17} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            aria-label="Search reviews"
          />
        </label>
      </div>

      {message && (
        <div className="adm-success" role="status">
          <CheckCircle2 size={19} />
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")}
            aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="adm-empty" role="status">
          <LoaderCircle size={27} />
          <p>Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="adm-empty" role="alert">
          <AlertCircle size={27} />
          <p>Could not load reviews.</p>
          {onRetry && (
            <button type="button" className="adm-action" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="adm-review-list">
          {filtered.map((review) => (
            <article className="adm-review-card" key={review.id}>
              <div className="adm-review-top">
                <div className="adm-record">
                  <span className="adm-avatar">
                    {review.name?.[0] || "?"}
                  </span>
                  <div>
                    <strong>{review.name}</strong>
                    <small>{review.movie}</small>
                  </div>
                </div>

                <button type="button" className="adm-delete"
                  onClick={() => {
                    setMessage("");
                    setSelected(review);
                  }}
                  aria-label={`Delete review by ${review.name}`}>
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>

              <p className="adm-review-text">{review.detail}</p>

              {Number.isFinite(review.rating) && (
                <div className="adm-review-rating">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={15}
                      fill={index < review.rating ? "currentColor" : "none"} />
                  ))}
                  <span>{review.rating}/5</span>
                </div>
              )}
            </article>
          ))}

          {!filtered.length && (
            <p className="adm-empty">
              {search ? "No matching reviews found." : "No reviews available."}
            </p>
          )}
        </div>
      )}

      <footer className="adm-panel-foot">
        <span>Showing {filtered.length} of {reviews.length} reviews</span>
        <span>Demo data · No database changes</span>
      </footer>

      {selected && (
        <div className="adm-confirm-backdrop">
          <div className="adm-confirm-dialog" role="alertdialog"
            aria-modal="true" aria-labelledby="delete-review-title"
            aria-describedby="delete-review-description">

            <button type="button" className="adm-confirm-close"
              onClick={() => setSelected(null)} aria-label="Cancel deletion">
              <X size={18} />
            </button>

            <span className="adm-confirm-icon">
              <Trash2 size={23} />
            </span>

            <h3 id="delete-review-title">Delete this review?</h3>
            <p id="delete-review-description">
              Remove <strong>{selected.name}</strong>'s review of{" "}
              <strong>{selected.movie}</strong>?
            </p>
            <small>Demo only. No real review will be deleted.</small>

            <div className="adm-confirm-actions">
              <button type="button" className="adm-confirm-cancel"
                onClick={() => setSelected(null)}>
                Cancel
              </button>

              <button type="button" className="adm-confirm-delete"
                onClick={deleteReview}>
                <Trash2 size={15} /> Delete review
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
