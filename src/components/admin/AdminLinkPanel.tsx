import { useState } from 'react'
import Badge from '../shared/Badge'

interface AdminLinkPanelProps {
  adminCode: string
}

export default function AdminLinkPanel({ adminCode }: AdminLinkPanelProps) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/manage/${adminCode}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-700">Enlace de admin</span>
        <Badge variant="warning">Privado</Badge>
      </div>
      <p className="text-xs text-gray-400 mb-1 break-all">{url}</p>
      <p className="text-xs text-red-400 mb-3">¡No lo compartas! Da acceso completo.</p>
      <button
        onClick={handleCopy}
        className="w-full py-2 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
      >
        {copied ? '¡Copiado!' : 'Copiar enlace admin'}
      </button>
    </div>
  )
}
