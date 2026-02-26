import { useState } from 'react'
import Modal from '../shared/Modal'
import Input from '../shared/Input'
import Button from '../shared/Button'
import type { ListItem } from '../../types/list'

interface ReserveModalProps {
  item: ListItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string) => Promise<void>
}

export default function ReserveModal({ item, isOpen, onClose, onConfirm }: ReserveModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Ingresa tu nombre'); return }
    setLoading(true)
    try {
      await onConfirm(trimmed)
      setName('')
      setError('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reservar')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setName('')
    setError('')
    onClose()
  }

  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reservar artículo" size="sm">
      <div className="flex flex-col gap-4">
        <div className="bg-pink-50 rounded-xl p-3">
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{item.category}</p>
        </div>
        <Input
          label="¿Cuál es tu nombre?"
          placeholder="María García"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          error={error}
          autoFocus
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={loading} className="flex-1">
            Reservar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
