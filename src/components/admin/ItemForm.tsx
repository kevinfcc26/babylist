import { useState } from 'react'
import Input from '../shared/Input'
import Button from '../shared/Button'
import { addItem, updateItem } from '../../services/items'
import { CATEGORIES, PRIORITIES } from '../../types/list'
import type { ListItem, Category, Priority } from '../../types/list'

interface ItemFormProps {
  listId: string
  adminCode: string
  item?: ListItem
  onSuccess: () => void
  onCancel: () => void
}

export default function ItemForm({ listId, adminCode, item, onSuccess, onCancel }: ItemFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: item?.name ?? '',
    category: (item?.category ?? CATEGORIES[0]) as Category,
    quantity: String(item?.quantity ?? 1),
    priority: (item?.priority ?? 'medium') as Priority,
    imageUrl: item?.imageUrl ?? '',
    notes: item?.notes ?? '',
    addedBy: item?.addedBy ?? '',
  })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (!form.addedBy.trim()) e.addedBy = 'El nombre de quien añade es requerido'
    const qty = Number(form.quantity)
    if (isNaN(qty) || qty < 1) e.quantity = 'La cantidad debe ser mayor a 0'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      const data = {
        name: form.name.trim(),
        category: form.category,
        quantity: Number(form.quantity),
        priority: form.priority,
        imageUrl: form.imageUrl.trim() || null,
        notes: form.notes.trim(),
        addedBy: form.addedBy.trim(),
        adminCode,
      }
      if (item) {
        await updateItem(listId, item.id, data)
      } else {
        await addItem(listId, data)
      }
      onSuccess()
    } catch (err) {
      setErrors({ _: err instanceof Error ? err.message : 'Error' })
    } finally {
      setLoading(false)
    }
  }

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }))
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Input
          label="Nombre del artículo *"
          placeholder="Pañales talla N"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Categoría</label>
        <select
          value={form.category}
          onChange={set('category')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pink-400"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Prioridad</label>
        <select
          value={form.priority}
          onChange={set('priority')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pink-400"
        >
          {PRIORITIES.map(p => (
            <option key={p} value={p}>
              {p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Cantidad *"
        type="number"
        min={1}
        value={form.quantity}
        onChange={set('quantity')}
        error={errors.quantity}
      />
      <Input
        label="URL de imagen (opcional)"
        placeholder="https://..."
        value={form.imageUrl}
        onChange={set('imageUrl')}
      />
      <div className="md:col-span-2">
        <Input
          label="Añadido por *"
          placeholder="María García"
          value={form.addedBy}
          onChange={set('addedBy')}
          error={errors.addedBy}
        />
      </div>
      <div className="md:col-span-2 flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Notas</label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          rows={2}
          placeholder="Marca, talla, color preferido..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pink-400 resize-none"
        />
      </div>
      {errors._ && <p className="md:col-span-2 text-sm text-red-500">{errors._}</p>}
      <div className="md:col-span-2 flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {item ? 'Guardar cambios' : 'Añadir artículo'}
        </Button>
      </div>
    </form>
  )
}
