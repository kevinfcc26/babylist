import { useState } from 'react'
import Badge from '../shared/Badge'

interface ShareLinkPanelProps {
  shareCode: string
}

export default function ShareLinkPanel({ shareCode }: ShareLinkPanelProps) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}${import.meta.env.BASE_URL}list/${shareCode}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-700">Enlace para familia</span>
        <Badge variant="success">Compartir</Badge>
      </div>
      <p className="text-xs text-gray-400 mb-3 break-all">{url}</p>
      <button
        onClick={handleCopy}
        className="w-full py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
      >
        {copied ? '¡Copiado!' : 'Copiar enlace'}
      </button>
    </div>
  )
}
