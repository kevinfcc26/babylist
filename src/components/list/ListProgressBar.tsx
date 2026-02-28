interface ListProgressBarProps {
  total: number
  reserved: number
}

export default function ListProgressBar({ total, reserved }: ListProgressBarProps) {
  if (total === 0) return null

  const reservedPct = Math.round((reserved / total) * 100)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progreso de la lista</span>
        <span className="text-sm text-gray-500">{reserved} / {total} reservados</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-green-400 transition-all duration-500"
          style={{ width: `${reservedPct}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          {reserved} reservados
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />
          {total - reserved} disponibles
        </span>
      </div>
    </div>
  )
}
