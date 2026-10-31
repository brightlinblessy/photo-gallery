# Photo Gallery (React + Vite + Tailwind CSS)

A modern, responsive Photo Gallery web application built with React, Vite, and Tailwind CSS. The app fetches high-quality photography from the Picsum Photos API, displays images in a grid adaptable to all screen sizes, enables real-time search filtering by author name, and allows users to save favourite photos with persistent browser storage.

---

## Technical Overview

### Tech Stack & Libraries

* **Framework:** React 19 (Functional components with hooks)
* **Build Tool:** Vite 8
* **Styling:** Tailwind CSS v4 (Utility-first CSS framework with native Vite integration)
* **Data Source:** [Picsum Photos API](https://picsum.photos/) (`[https://picsum.photos/v2/list?limit=30](https://picsum.photos/v2/list?limit=30)`)
* **State Management:** `useReducer` for favourites state management
* **Persistence:** Web Storage API (`localStorage`)

---

## Core Features & Implementation Details

### 1. Data Fetching & Custom Hook (`useFetchPhotos`)

The data fetching logic is encapsulated inside a custom React hook: `useFetchPhotos`.

* Requests 30 images on initial mount.
* Handles standard lifecycle states: `photos` array, `loading` boolean, and `error` string.
* Implements an `AbortController` to cancel pending HTTP requests if the component unmounts mid-flight, preventing potential memory leaks and state updates on unmounted components.

### 2. Search & Filter Optimization (`useMemo` & `useCallback`)

* **Real-Time Client-Side Search:** The search input filters the 30 loaded photos by author name instantly without issuing repetitive API calls.
* **Memoized Filtering (`useMemo`):** Computes `filteredPhotos` only when the underlying `photos` data or the active `query` changes. Interacting with unrelated state (like toggling a favourite) does not trigger unnecessary array re-filtering.
* **Stable Event Handler (`useCallback`):** Wraps the search input change event handler (`handleSearchChange`) to ensure a stable function reference across component re-renders.

### 3. Favourites State Management & Persistence (`useReducer` + `localStorage`)

* **Centralized Reducer:** Favourites logic is isolated within `favouritesReducer.js`. A single `TOGGLE_FAVOURITE` action handles both adding and removing photo IDs.
* **Lazy Initialization:** `localStorage` is synchronously queried during initial state initialization (`initFavourites`), ensuring saved state displays on the first render without layout shifts or momentary state overwrites.
* **Auto-Syncing:** A side effect (`useEffect`) watches the `favourites` state array and synchronizes changes to `localStorage` key `photo-gallery-favourites`.

### 4. Responsive UI Layout (Tailwind CSS)

* **Grid Layout:** Built using Tailwind's CSS Grid utilities:
* Mobile (`< 768px`): 1 column
* Tablet (`≥ 768px`): 2 columns
* Desktop (`≥ 1024px`): 4 columns


* **States & Fallbacks:** Includes customized UI feedback states for:
* Active fetching (Animated spinner)
* HTTP or Network failures (Styled error notification)
* Empty search results (No-match informational message)



---

## Project Structure

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

---

## Getting Started

### Prerequisites

* **Node.js**: v20.19.0 or higher
* **npm**: Package manager included with Node.js

### Installation & Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/<your-username>/photo-gallery.git
cd photo-gallery

```


2. **Install dependencies:**
```bash
npm install

```


3. **Start the development server:**
```bash
npm run dev

```


Open `http://localhost:5173` in your browser to view the application.
4. **Build for production:**
```bash
npm run build
npm run preview

```



---

## Component Architecture

* **`App.jsx`**: Base application wrapper applying main layout structure and background colors.
* **`Gallery.jsx`**: Main view container that calls `useFetchPhotos`, manages search query state, interacts with `favouritesReducer`, and renders layout sections.
* **`PhotoCard.jsx`**: Card component that accepts individual photo metadata and renders image artwork, author label, and interactive favourite toggle button.
* **`SearchBar.jsx`**: Controlled input field component for real-time text query changes.
* **`Spinner.jsx`**: CSS-animated loader component displayed while fetching photos.
