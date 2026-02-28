import { CATEGORIES } from '../../types/list'

interface CategoryFilterProps {
  selected: string | null
  onChange: (category: string | null) => void
  counts: Record<string, number>
}

export default function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-green-400 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
        }`}
      >
        Todos
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-green-400 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
          }`}
        >
          {cat} {counts[cat] ? `(${counts[cat]})` : ''}
        </button>
      ))}
    </div>
  )
}
