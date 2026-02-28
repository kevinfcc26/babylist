import { useState } from 'react'
import Badge from '../shared/Badge'
import ReserveModal from './ReserveModal'
import { reserveItem } from '../../services/items'
import type { ListItem } from '../../types/list'

interface ItemCardProps {
  listId: string
  shareCode: string
  item: ListItem
  onMutate: () => void
}

export default function ItemCard({ listId, shareCode, item, onMutate }: ItemCardProps) {
  const [reserveOpen, setReserveOpen] = useState(false)

  async function handleReserve(name: string) {
    await reserveItem(listId, item.id, name, shareCode)
    onMutate()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-40 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">{item.category}</Badge>
          {item.isReserved && <Badge variant="warning">Reservado</Badge>}
        </div>

        <div className="text-sm text-gray-500">
          {item.reservedBy && (
            <p>Reservado por: <span className="text-gray-700 font-medium">{item.reservedBy}</span></p>
          )}
        </div>

        <div className="mt-auto pt-2">
          {!item.isReserved && (
            <button
              onClick={() => setReserveOpen(true)}
              className="w-full py-2 bg-green-400 text-white rounded-xl text-sm font-medium hover:bg-green-500 transition-colors"
            >
              Reservar
            </button>
          )}
        </div>
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
