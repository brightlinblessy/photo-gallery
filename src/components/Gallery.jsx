import { useState, useReducer, useEffect, useCallback, useMemo } from 'react'
import useFetchPhotos from '../hooks/useFetchPhotos.js'
import {
  favouritesReducer,
  initFavourites,
  STORAGE_KEY,
  TOGGLE_FAVOURITE,
} from '../reducers/favouritesReducer.js'
import SearchBar from './SearchBar.jsx'
import PhotoCard from './PhotoCard.jsx'
import Spinner from './Spinner.jsx'

export default function Gallery() {
  const { photos, loading, error } = useFetchPhotos()
  const [query, setQuery] = useState('')
  const [favourites, dispatch] = useReducer(favouritesReducer, [], initFavourites)

  // Save favourites to localStorage every time they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites))
  }, [favourites])

  // useCallback: keeps the same function reference between renders,
  // so SearchBar is not handed a brand-new handler on every re-render
  const handleSearchChange = useCallback((event) => {
    setQuery(event.target.value)
  }, [])

  // useMemo: only re-filters when photos or query change,
  // not when an unrelated state (like favourites) changes
  const filteredPhotos = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return photos
    return photos.filter((photo) => photo.author.toLowerCase().includes(term))
  }, [photos, query])

  const handleToggle = (id) => dispatch({ type: TOGGLE_FAVOURITE, payload: id })

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Photo Gallery</h1>
        <SearchBar value={query} onChange={handleSearchChange} />
      </header>

      {loading && <Spinner />}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Could not load photos: {error}. Check your connection and refresh the page.
        </p>
      )}

      {!loading && !error && filteredPhotos.length === 0 && (
        <p className="py-16 text-center text-stone-500">No photos match “{query}”.</p>
      )}

      {!loading && !error && filteredPhotos.length > 0 && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isFavourite={favourites.includes(photo.id)}
              onToggle={handleToggle}
            />
          ))}
        </section>
      )}
    </main>
  )
}
