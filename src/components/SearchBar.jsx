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
