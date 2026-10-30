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
