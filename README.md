# Photo Gallery (React + Vite + Tailwind CSS)

A Photo Gallery web app for the Celebrare Frontend React Internship pre-screening assignment.
It fetches 30 photos from the Picsum Photos API, shows them in a responsive grid, filters them by author name as you type, and lets you mark favourites that persist after a page refresh.

**Scope (exactly the 7 requirements, nothing extra):** project setup, API fetch with loading and error states, responsive grid, search filter, favourites with `useReducer` + `localStorage`, custom hook `useFetchPhotos`, `useCallback` + `useMemo`.

---

## Table of contents

1. [Tech stack and rules followed](#1-tech-stack-and-rules-followed)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Create the React + Vite project](#step-1-create-the-react--vite-project)
4. [Step 2: Install and configure Tailwind CSS](#step-2-install-and-configure-tailwind-css)
5. [Step 3: Folder structure](#step-3-folder-structure)
6. [Step 4: Custom hook `useFetchPhotos`](#step-4-custom-hook-usefetchphotos-requirements-2-and-6)
7. [Step 5: Favourites reducer](#step-5-favourites-reducer-requirement-5)
8. [Step 6: UI components](#step-6-ui-components-requirements-2-3-and-4)
9. [Step 7: Gallery component](#step-7-gallery-component-requirements-4-5-6-and-7)
10. [Step 8: App and entry files](#step-8-app-and-entry-files)
11. [Step 9: Run and test](#step-9-run-and-test-the-app)
12. [Step 10: Push to GitHub](#step-10-push-to-github)
13. [Step 11: Record the 5-minute video](#step-11-record-the-5-minute-screen-recording)
14. [Step 12: Submit](#step-12-submit)
15. [Requirement checklist](#requirement-checklist)

---

## 1. Tech stack and rules followed

| Item | Choice |
| --- | --- |
| Framework | React (functional components + hooks only, no class components) |
| Build tool | Vite |
| Styling | Tailwind CSS only (no MUI, Ant Design, Bootstrap or any component library) |
| Data | https://picsum.photos/v2/list?limit=30 |
| Favourites state | `useReducer` (not `useState`) |
| Persistence | `localStorage` |

Installed versions at the time of writing: React `^19.3.1`, Vite `^8.3.5`, Tailwind CSS `^4.3.3`.

## 2. Prerequisites

- Node.js 20.19+ (or 22.12+). Check with `node -v`.
- npm (comes with Node). Check with `npm -v`.
- Git and a GitHub account.
- A code editor such as VS Code.

---

## Step 1: Create the React + Vite project

```bash
npm create vite@latest photo-gallery -- --template react
cd photo-gallery
npm install
```

If the CLI asks questions, choose **React** and **JavaScript**.

Delete the files you will not use: `src/App.css`, `src/assets/`, and `public/vite.svg` (and remove the `vite.svg` link from `index.html` if present).

## Step 2: Install and configure Tailwind CSS

**2.1 Install Tailwind and its Vite plugin**

```bash
npm install tailwindcss @tailwindcss/vite
```

**2.2 Register the plugin in `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**2.3 Import Tailwind in `src/index.css`** (replace everything in the file with this one line)

```css
@import "tailwindcss";
```

There is no `tailwind.config.js` or `postcss.config.js` in Tailwind v4, the Vite plugin handles it.

**2.4 Set the page title in `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Photo Gallery</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## Step 3: Folder structure

Create these folders and files inside `src/`:

```text
photo-gallery/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Gallery.jsx
    │   ├── PhotoCard.jsx
    │   ├── SearchBar.jsx
    │   └── Spinner.jsx
    ├── hooks/
    │   └── useFetchPhotos.js
    └── reducers/
        └── favouritesReducer.js
```

```bash
mkdir -p src/components src/hooks src/reducers
```

## Step 4: Custom hook `useFetchPhotos` (requirements 2 and 6)

File: `src/hooks/useFetchPhotos.js`

```js
import { useState, useEffect } from 'react'

const API_URL = 'https://picsum.photos/v2/list?limit=30'

// Fetches the photo list once on mount.
// Returns: { photos, loading, error }
export default function useFetchPhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchPhotos() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(API_URL, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        setPhotos(data)
      } catch (err) {
        // Ignore the abort that happens when the component unmounts
        if (err.name !== 'AbortError') {
          setError(err.message || 'Something went wrong')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchPhotos()

    // Cleanup: cancel the request if the component unmounts
    return () => controller.abort()
  }, [])

  return { photos, loading, error }
}
```

How it works:

1. `photos`, `loading` and `error` start as `[]`, `true` and `null`.
2. `useEffect` with an empty dependency array runs the fetch once when the component mounts.
3. If the response is not OK (for example a 500), the code throws, the `catch` block stores the message in `error`.
4. `finally` sets `loading` to `false` so the spinner always disappears.
5. The `AbortController` cancels the request on unmount (this also keeps React StrictMode, which runs effects twice in development, from causing stale updates).
6. The hook returns `{ photos, loading, error }`, exactly what the assignment asks for.

## Step 5: Favourites reducer (requirement 5)

File: `src/reducers/favouritesReducer.js`

```js
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
```

How it works:

- State is a plain array of favourited photo ids.
- The reducer handles one action, `TOGGLE_FAVOURITE`: if the id is already in the array it is removed, otherwise it is added.
- `initFavourites` is passed to `useReducer` as the lazy initializer, so saved favourites are read from `localStorage` on the first render. The `try/catch` protects against corrupted or blocked storage.

## Step 6: UI components (requirements 2, 3 and 4)

**6.1 Spinner** (`src/components/Spinner.jsx`): shown while loading.

```jsx
export default function Spinner() {
  return (
    <div className="flex justify-center py-24" role="status" aria-label="Loading photos">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-rose-500" />
    </div>
  )
}
```

**6.2 SearchBar** (`src/components/SearchBar.jsx`): a controlled input.

```jsx
export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder="Search by author name"
      aria-label="Search photos by author name"
      className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 sm:max-w-md"
    />
  )
}
```

**6.3 PhotoCard** (`src/components/PhotoCard.jsx`): photo, author name and a heart icon button. The heart is an inline SVG, so no icon library is needed.

```jsx
export default function PhotoCard({ photo, isFavourite, onToggle }) {
  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <img
        src={`https://picsum.photos/id/${photo.id}/600/450`}
        alt={`Photo by ${photo.author}`}
        loading="lazy"
        className="aspect-[4/3] w-full bg-stone-200 object-cover"
      />

      <div className="flex items-center justify-between px-4 py-3">
        <p className="truncate pr-2 text-sm font-medium">{photo.author}</p>

        <button
          type="button"
          onClick={() => onToggle(photo.id)}
          aria-pressed={isFavourite}
          aria-label={isFavourite ? `Remove ${photo.author}'s photo from favourites` : `Add ${photo.author}'s photo to favourites`}
          className="rounded-full p-1.5 transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-500"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-6 w-6 ${isFavourite ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-stone-500'}`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </article>
  )
}
```

## Step 7: Gallery component (requirements 4, 5, 6 and 7)

File: `src/components/Gallery.jsx`

```jsx
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
```

Key points:

- **Custom hook:** the component calls `useFetchPhotos()` and never calls `fetch` itself.
- **Responsive grid:** `grid-cols-1` (mobile), `md:grid-cols-2` (tablet, 768px and up), `lg:grid-cols-4` (desktop, 1024px and up).
- **Search:** filters the already-fetched `photos` array in the browser. No API call is made while typing.
- **`useReducer`:** favourites are managed by `favouritesReducer`; the heart button dispatches `TOGGLE_FAVOURITE`.
- **`useEffect`:** writes `favourites` to `localStorage` whenever it changes.
- **`useCallback`:** wraps `handleSearchChange`.
- **`useMemo`:** computes `filteredPhotos`.

## Step 8: App and entry files

**8.1** `src/App.jsx`

```jsx
import Gallery from './components/Gallery.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Gallery />
    </div>
  )
}
```

**8.2** `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## Step 9: Run and test the app

```bash
npm run dev
```

Open the local URL shown in the terminal (usually http://localhost:5173) and check each item:

| # | What to test | Expected result |
| --- | --- | --- |
| 1 | Reload the page | Spinner shows briefly, then 30 photos appear |
| 2 | Resize the browser | 4 columns on desktop, 2 on tablet, 1 on mobile |
| 3 | Type an author name in the search box | Grid filters instantly, no network request in DevTools |
| 4 | Type a name that does not exist | "No photos match" message appears |
| 5 | Click a heart | Heart turns filled pink; click again to remove |
| 6 | Refresh the page | Favourites are still marked |
| 7 | DevTools, Application tab, Local Storage | Key `photo-gallery-favourites` holds an array of ids |
| 8 | DevTools, Network tab, set throttling to **Offline**, then reload | Error message shows instead of the grid |

Create a production build to confirm there are no errors:

```bash
npm run build
npm run preview
```

## Step 10: Push to GitHub

1. Create a new **public** repository on GitHub named `photo-gallery` (do not add a README, you already have one).
2. In the project folder run:

```bash
git init
git add .
git commit -m "Photo gallery: React + Vite + Tailwind"
git branch -M main
git remote add origin https://github.com/<your-username>/photo-gallery.git
git push -u origin main
```

3. Open the repository in the browser and check that `src/`, `package.json` and this `README.md` are there, and that `node_modules/` is **not** (it is listed in `.gitignore`).

## Step 11: Record the 5-minute screen recording

Recording is mandatory, submissions without it are not reviewed.

- **Windows:** press `Win + G`. **Mac:** QuickTime, then File, then New Screen Recording. **Any OS:** OBS Studio.
- Keep the app, VS Code and DevTools ready before you press record.
- Upload to Google Drive or YouTube and set it to **Unlisted** (or "Anyone with the link"). Open the link in a private window to confirm it plays.

**Suggested script (about 5 minutes):**

**1. Show the app working (about 1 minute)**
Open the app. Show photos loading, type an author name to filter, click a few hearts, then refresh the page to show the favourites are still there.

**2. `useFetchPhotos` (about 1 minute)**
"This hook holds three pieces of state: `photos`, `loading` and `error`. It fetches the Picsum list once when the component mounts and returns `{ photos, loading, error }`. If the API fails, or returns a non-OK status, the `catch` block saves the message in `error`, and `finally` turns `loading` off. The Gallery then shows an error message instead of the grid. I also use an AbortController to cancel the request if the component unmounts."

**3. `useReducer` (about 1 minute)**
"The reducer handles one action, `TOGGLE_FAVOURITE`. If the photo id is already in the list it removes it, otherwise it adds it. I used `useReducer` because all changes to favourites go through one function with named actions, which keeps the logic in one place and easy to extend, for example adding a clear-all action later. The initial state is loaded from `localStorage` using a lazy initializer, and a `useEffect` saves the list back whenever it changes."

**4. `useCallback` and `useMemo` (about 1 minute)**
"`useMemo` computes `filteredPhotos`. It only re-runs when `photos` or `query` change, so toggling a favourite does not re-filter the whole list. `useCallback` wraps `handleSearchChange` so the function keeps the same reference between renders instead of being recreated each time. If I removed `useMemo`, the filter would run on every render, including every heart click. If I removed `useCallback`, the handler would be re-created on every render, and any memoized child that received it would re-render needlessly. With only 30 photos the difference is small, but this is the pattern that matters as the list grows."

**5. One difficult thing (about 1 minute)**
Pick something you really struggled with and explain the problem and your fix. Possible honest examples from this project:
- Keeping favourites after a refresh: reading `localStorage` in the reducer's lazy initializer, rather than in an effect that runs after the first render and would briefly overwrite saved data with an empty list.
- React StrictMode running the fetch effect twice in development, solved with an AbortController cleanup.
- Making the grid responsive with Tailwind's `md:` and `lg:` breakpoints.

Choose the one that is true for you, because you must be able to explain every line.

## Step 12: Submit

1. Copy your public GitHub repository link.
2. Copy your unlisted video link.
3. Open the Google Form that was shared with you and fill in:
   - GitHub link
   - Recording link
   - One line about the hardest part of the assignment
4. Submit **within 24 hours** of receiving the assignment.

## Requirement checklist

- [x] React + Vite project, Tailwind CSS only, no UI libraries
- [x] Fetches 30 photos from `https://picsum.photos/v2/list?limit=30` on load
- [x] Loading spinner while fetching, error message if the fetch fails
- [x] Grid: 4 columns desktop, 2 tablet, 1 mobile; each card has photo, author and heart button
- [x] Real-time search by author name, filtering already-fetched data (no API call)
- [x] Favourites managed with `useReducer`, persisted in `localStorage`
- [x] Custom hook `useFetchPhotos` returning `photos`, `loading`, `error`, used by Gallery
- [x] `useCallback` on the search handler, `useMemo` for the filtered list
- [x] Functional components only, no extra features
