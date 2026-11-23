import { useEffect, useState } from 'react'
import { fetchMovie, loadMovies } from '../api/movies'
import { fetchCommunities } from '../api/communities'

function replaceMovie(list, latest) {
  return list.map((movie) => (movie.id === latest.id ? latest : movie))
}

// loads movies + communities from the API once,
// and fresh details for the movie that is open
export default function useMovieCatalogue({ selectedId, notify }) {
  const [movies, setMovies] = useState([])
  const [dataSource, setDataSource] = useState('loading') // loading | live | error
  const [loadError, setLoadError] = useState('')
  const [communities, setCommunities] = useState([])
  const live = dataSource === 'live'

  useEffect(() => {
    let ignore = false // page closed → ignore late answer
    loadMovies().then((result) => {
      if (ignore) return
      setMovies(result.movies)
      setDataSource(result.source)
      setLoadError(result.error || '')
      if (result.error) notify('Could not load movies: ' + result.error)
    })
    fetchCommunities()
      .then((list) => {
        if (!ignore) setCommunities(list)
      })
      .catch((error) => {
        if (!ignore) console.warn('Could not load communities:', error.message)
      })
    return () => {
      ignore = true
    }
  }, [notify])

  useEffect(() => {
    if (!live || selectedId === null) return
    fetchMovie(selectedId)
      .then((latest) => setMovies((list) => replaceMovie(list, latest)))
      .catch((error) => notify('Could not load movie details: ' + error.message))
  }, [live, selectedId, notify])

  // after rating: get new average, swap the movie in the list
  function refreshMovie(id) {
    return fetchMovie(id)
      .then((latest) => setMovies((list) => replaceMovie(list, latest)))
      .catch((error) =>
        notify('Could not refresh movie details: ' + error.message),
      )
  }

  return { movies, communities, dataSource, loadError, live, refreshMovie }
}
