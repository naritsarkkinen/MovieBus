import MovieVerseCatalogue from '../components/MovieVerseCatalogue'
import MovieVerseFriendModal from '../components/MovieVerseFriendModal'
import MovieVerseMovieModal from '../components/MovieVerseMovieModal'
import MovieVerseProfileModal from '../components/MovieVerseProfileModal'
import { API_FAILED_TEXT } from '../data/MovieVersePlaces'

// the big popups on top of the world:
// catalogue, one friend, one movie, and Avatar Studio
export default function MovieVersePopups(props) {
  return (
    <>
      {props.catalogueOpen && <CataloguePopup {...props} />}
      {props.friends.openFriend && <FriendPopup friends={props.friends} />}
      {props.selected && <MoviePopup {...props} />}
      {props.profile.draft && <ProfilePopup profile={props.profile} />}
    </>
  )
}

function CataloguePopup({ catalogue, filteredMovies, selected, friends, profile, onSelectMovie, onCloseCatalogue }) {
  const apiFailed = catalogue.dataSource === 'error'
  // another popup on top → catalogue keys do nothing
  const onTop = !selected && !friends.openFriend && !profile.draft
  return (
    <MovieVerseCatalogue
      movies={filteredMovies}
      emptyText={apiFailed ? API_FAILED_TEXT : 'No movies found. Try another search or genre.'}
      active={onTop}
      onOpen={onSelectMovie}
      onClose={onCloseCatalogue}
    />
  )
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

function ProfilePopup({ profile }) {
  return (
    <MovieVerseProfileModal
      {...profile.draft}
      signedIn={Boolean(profile.session)}
      onAuthenticate={profile.signIn}
      onName={(value) => profile.change('name', value)}
      onAvatar={(value) => profile.change('avatar', value)}
      onSkin={(value) => profile.change('skin', value)}
      onSave={profile.save}
      pending={profile.pending}
      onClose={profile.close}
    />
  )
}
