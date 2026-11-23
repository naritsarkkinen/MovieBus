import MovieVerseCatalogue from '../components/MovieVerseCatalogue'
import MovieVerseWatchlist from '../components/MovieVerseWatchlist'
import MovieVerseCommunities from '../components/MovieVerseCommunities'
import MovieVerseFriendModal from '../components/MovieVerseFriendModal'
import MovieVerseMovieModal from '../components/MovieVerseMovieModal'
import MovieVerseProfileModal from '../components/MovieVerseProfileModal'

// the big overlay panels: catalogue/watchlist/communities list,
// one friend, one movie, and Avatar Studio
export default function MovieVersePopups(props) {
  return (
    <>
      <ListOverlay {...props} />
      {props.friends.openFriend && <FriendPopup friends={props.friends} />}
      {props.selected && <MoviePopup {...props} />}
      {props.profile.draft && (
        <ProfilePopup profile={props.profile} onSave={props.onSaveProfile} />
      )}
    </>
  )
}

function ListOverlay({ overlay, onCloseOverlay, onSelectMovie, ...props }) {
  if (overlay === 'catalogue') {
    return (
      <MovieVerseCatalogue
        movies={props.filteredMovies}
        apiFailed={props.catalogue.dataSource === 'error'}
        onSelect={onSelectMovie}
        onClose={onCloseOverlay}
      />
    )
  }
  if (overlay === 'watchlist') {
    return (
      <MovieVerseWatchlist
        movies={props.watchlistMovies}
        onSelect={onSelectMovie}
        onClose={onCloseOverlay}
      />
    )
  }
  if (overlay === 'communities') {
    return (
      <MovieVerseCommunities
        communities={props.catalogue.communities}
        isMember={props.membership.isMember}
        onToggle={props.membership.toggleCommunity}
        onClose={onCloseOverlay}
      />
    )
  }
  return null
}

function FriendPopup({ friends }) {
  return (
    <MovieVerseFriendModal
      friend={friends.openFriend}
      invited={friends.isInvited(friends.openFriend)}
      onInvite={friends.invite}
      onWave={friends.wave}
      onClose={friends.closeFriend}
    />
  )
}

function MoviePopup({ selected, feedback, watchlist, reviewsFor, onCloseMovie }) {
  return (
    <MovieVerseMovieModal
      movie={selected}
      myRating={feedback.myRatingFor(selected.id)}
      inWatchlist={watchlist.isSaved(selected.id)}
      review={feedback.draftFor(selected.id)}
      onReviewChange={(value) => feedback.setDraft(selected.id, value)}
      onRate={(n) => feedback.rate(selected, n)}
      onToggleWatchlist={() => watchlist.toggleWatchlist(selected.id)}
      onSaveReview={() => feedback.saveReview(selected)}
      ratingPending={feedback.ratingPending}
      reviewPending={feedback.reviewPending}
      reviews={reviewsFor(selected.id)}
      onClose={onCloseMovie}
    />
  )
}

function ProfilePopup({ profile, onSave }) {
  return (
    <MovieVerseProfileModal
      {...profile.draft}
      signedIn={Boolean(profile.session)}
      onAuthenticate={profile.signIn}
      onName={(value) => profile.change('name', value)}
      onAvatar={(value) => profile.change('avatar', value)}
      onSkin={(value) => profile.change('skin', value)}
      onSave={onSave}
      pending={profile.pending}
      onClose={profile.close}
    />
  )
}
