import { useState } from 'react'
import Input from '../shared/Input'
import Button from '../shared/Button'
import { suggestItem } from '../../services/items'
import { CATEGORIES } from '../../types/list'
import type { Category } from '../../types/list'

interface SuggestItemFormProps {
  listId: string
  shareCode: string
  onSuccess: () => void
  onCancel: () => void
}

export default function SuggestItemForm({ listId, shareCode, onSuccess, onCancel }: SuggestItemFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0] as Category,
    notes: '',
    addedBy: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    if (!form.addedBy.trim()) { setError('Tu nombre es requerido'); return }
    setLoading(true)
    try {
      await suggestItem(listId, shareCode, {
        name: form.name.trim(),
        category: form.category,
        notes: form.notes.trim(),
        addedBy: form.addedBy.trim(),
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al sugerir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre del artículo"
        placeholder="Ej. Pañales talla 1"
        value={form.name}
        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Categoría</label>
        <select
          value={form.category}
          onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pink-400"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <Input
        label="Notas (opcional)"
        placeholder="Marca, talla, color..."
        value={form.notes}
        onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
      />
      <Input
        label="Tu nombre"
        placeholder="María García"
        value={form.addedBy}
        onChange={e => setForm(p => ({ ...p, addedBy: e.target.value }))}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Sugerir
        </Button>
      </div>
    </form>
  )
}
