import Modal from '../shared/Modal'
import Button from '../shared/Button'
import type { ListItem } from '../../types/list'

interface DeleteConfirmModalProps {
  item: ListItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  loading?: boolean
}

export default function DeleteConfirmModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar artículo" size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-gray-600">
          ¿Estás seguro que deseas eliminar{' '}
          <span className="font-semibold text-gray-900">{item.name}</span>?
          Esta acción no se puede deshacer.
        </p>
        {item.isReserved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
            ¡Este artículo está reservado por {item.reservedBy}!
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
