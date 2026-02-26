interface ListProgressBarProps {
  total: number
  purchased: number
  reserved: number
}

export default function ListProgressBar({ total, purchased, reserved }: ListProgressBarProps) {
  if (total === 0) return null

  const purchasedPct = Math.round((purchased / total) * 100)
  const reservedPct = Math.round((reserved / total) * 100)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progreso de la lista</span>
        <span className="text-sm text-gray-500">{purchased} / {total} comprados</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-green-400 transition-all duration-500"
          style={{ width: `${purchasedPct}%` }}
        />
        <div
          className="h-full bg-yellow-300 transition-all duration-500"
          style={{ width: `${reservedPct}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          {purchased} comprados
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" />
          {reserved} reservados
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />
          {total - purchased - reserved} disponibles
        </span>
      </div>
    </div>
  )
}
