import PriorityBadge from '../list/PriorityBadge'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import type { ListItem } from '../../types/list'

interface ItemTableProps {
  items: ListItem[]
  onEdit: (item: ListItem) => void
  onDelete: (item: ListItem) => void
}

export default function ItemTable({ items, onEdit, onDelete }: ItemTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Artículo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Qty</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Prioridad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Reservado por</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.category}</td>
                <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                <td className="px-4 py-3"><PriorityBadge priority={item.priority} /></td>
                <td className="px-4 py-3">
                  {item.isPurchased
                    ? <Badge variant="success">Comprado</Badge>
                    : item.isReserved
                    ? <Badge variant="warning">Reservado</Badge>
                    : <Badge variant="neutral">Disponible</Badge>}
                </td>
                <td className="px-4 py-3 text-gray-500">{item.reservedBy ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(item)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-semibold text-gray-900">{item.name}</p>
              <PriorityBadge priority={item.priority} />
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="info">{item.category}</Badge>
              {item.isPurchased
                ? <Badge variant="success">Comprado</Badge>
                : item.isReserved
                ? <Badge variant="warning">Reservado</Badge>
                : <Badge variant="neutral">Disponible</Badge>}
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Cantidad: {item.quantity}
              {item.reservedBy ? ` · Reservado por ${item.reservedBy}` : ''}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => onEdit(item)} className="flex-1">
                Editar
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(item)} className="flex-1">
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
