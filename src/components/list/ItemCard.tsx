import { useState } from 'react'
import Badge from '../shared/Badge'
import PriorityBadge from './PriorityBadge'
import ReserveModal from './ReserveModal'
import { reserveItem, cancelReservation, markPurchased } from '../../services/items'
import type { ListItem } from '../../types/list'

interface ItemCardProps {
  listId: string
  shareCode: string
  item: ListItem
  onMutate: () => void
}

export default function ItemCard({ listId, shareCode, item, onMutate }: ItemCardProps) {
  const [reserveOpen, setReserveOpen] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseName, setPurchaseName] = useState('')
  const [showPurchaseInput, setShowPurchaseInput] = useState(false)
  const [error, setError] = useState('')

  async function handleReserve(name: string) {
    await reserveItem(listId, item.id, name, shareCode)
    onMutate()
  }

  async function handleCancelReserve() {
    const name = item.reservedBy ?? ''
    if (!name) return
    try {
      await cancelReservation(listId, item.id, name, shareCode)
      onMutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar')
    }
  }

  async function handleMarkPurchased() {
    const name = purchaseName.trim()
    if (!name) return
    setPurchaseLoading(true)
    try {
      await markPurchased(listId, item.id, name, shareCode)
      setShowPurchaseInput(false)
      setPurchaseName('')
      onMutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar')
    } finally {
      setPurchaseLoading(false)
    }
  }

  const statusBadge = item.isPurchased
    ? <Badge variant="success">Comprado</Badge>
    : item.isReserved
    ? <Badge variant="warning">Reservado</Badge>
    : <Badge variant="neutral">Disponible</Badge>

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all ${
        item.isPurchased ? 'opacity-70 border-green-200' : 'border-gray-100 hover:shadow-md'
      }`}
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-40 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
          <PriorityBadge priority={item.priority} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">{item.category}</Badge>
          {statusBadge}
        </div>

        <div className="text-sm text-gray-500 space-y-0.5">
          <p>Cantidad: <span className="text-gray-700">{item.quantity}</span></p>
          {item.reservedBy && !item.isPurchased && (
            <p>Reservado por: <span className="text-gray-700 font-medium">{item.reservedBy}</span></p>
          )}
          {item.purchasedBy && (
            <p>Comprado por: <span className="text-gray-700 font-medium">{item.purchasedBy}</span></p>
          )}
          {item.notes && <p className="text-gray-400 italic mt-1">{item.notes}</p>}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {!item.isPurchased && (
          <div className="mt-auto pt-2 flex flex-col gap-2">
            {!item.isReserved && (
              <button
                onClick={() => setReserveOpen(true)}
                className="w-full py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
              >
                Reservar
              </button>
            )}
            {item.isReserved && (
              <button
                onClick={handleCancelReserve}
                className="w-full py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar reserva
              </button>
            )}
            {!showPurchaseInput ? (
              <button
                onClick={() => setShowPurchaseInput(true)}
                className="w-full py-2 border border-green-400 text-green-600 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors"
              >
                Marcar como comprado
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pink-400"
                  placeholder="Tu nombre"
                  value={purchaseName}
                  onChange={e => setPurchaseName(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleMarkPurchased}
                  disabled={purchaseLoading}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  {purchaseLoading ? '...' : 'OK'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ReserveModal
        item={item}
        isOpen={reserveOpen}
        onClose={() => setReserveOpen(false)}
        onConfirm={handleReserve}
      />
    </div>
  )
}
