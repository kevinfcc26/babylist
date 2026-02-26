interface SheetsSyncStatusProps {
  googleSheetId: string | null
  listId: string
}

export default function SheetsSyncStatus({ googleSheetId }: SheetsSyncStatusProps) {
  if (!googleSheetId) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-700 mb-1">Google Sheets</p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Creando hoja de cálculo...
        </div>
        <p className="text-xs text-gray-400 mt-1">Puede tardar unos segundos</p>
      </div>
    )
  }

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-sm font-semibold text-gray-700 mb-1">Google Sheets</p>
      <p className="text-xs text-green-600 mb-3 flex items-center gap-1">
        <span>✓</span> Sincronizado automáticamente
      </p>
      <a
        href={sheetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-2 text-center bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
      >
        Abrir hoja de cálculo
      </a>
    </div>
  )
}
