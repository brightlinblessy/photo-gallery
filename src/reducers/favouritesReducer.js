export const STORAGE_KEY = 'photo-gallery-favourites'

export const TOGGLE_FAVOURITE = 'TOGGLE_FAVOURITE'

// State is an array of favourited photo ids, e.g. ['10', '24']
export function favouritesReducer(state, action) {
  switch (action.type) {
    case TOGGLE_FAVOURITE:
      return state.includes(action.payload)
        ? state.filter((id) => id !== action.payload)
        : [...state, action.payload]
    default:
      return state
  }
}

// Lazy initializer: reads saved favourites from localStorage on first render
export function initFavourites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
