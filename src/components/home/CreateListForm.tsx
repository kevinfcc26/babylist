import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../shared/Input'
import Button from '../shared/Button'
import { createList } from '../../services/lists'

export default function CreateListForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    title: '',
    ownerName: '',
    babyName: '',
    dueDate: '',
  })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'El título es requerido'
    if (!form.ownerName.trim()) e.ownerName = 'Tu nombre es requerido'
    if (!form.babyName.trim()) e.babyName = 'El nombre del bebé es requerido'
    if (!form.dueDate) e.dueDate = 'La fecha esperada es requerida'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      const list = await createList(form)
      navigate(`/manage/${list.adminCode}`)
    } catch (err) {
      setErrors({ _: err instanceof Error ? err.message : 'Error al crear la lista' })
    } finally {
      setLoading(false)
    }
  }

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }))
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Título de la lista"
        placeholder="Baby Shower de María"
        value={form.title}
        onChange={set('title')}
        error={errors.title}
      />
      <Input
        label="Tu nombre"
        placeholder="María García"
        value={form.ownerName}
        onChange={set('ownerName')}
        error={errors.ownerName}
      />
      <Input
        label="Nombre del bebé"
        placeholder="Baby Girl / Sofía"
        value={form.babyName}
        onChange={set('babyName')}
        error={errors.babyName}
      />
      <Input
        label="Fecha esperada"
        type="date"
        value={form.dueDate}
        onChange={set('dueDate')}
        error={errors.dueDate}
      />
      {errors._ && <p className="text-sm text-red-500">{errors._}</p>}
      <Button type="submit" loading={loading} className="w-full mt-2">
        Crear lista
      </Button>
    </form>
  )
}
