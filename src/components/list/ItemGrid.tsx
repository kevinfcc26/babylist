import ItemCard from './ItemCard'
import type { ListItem } from '../../types/list'

interface ItemGridProps {
  listId: string
  shareCode: string
  items: ListItem[]
  onMutate: () => void
}

export default function ItemGrid({ listId, shareCode, items, onMutate }: ItemGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => (
        <ItemCard
          key={item.id}
          listId={listId}
          shareCode={shareCode}
          item={item}
          onMutate={onMutate}
        />
      ))}
    </div>
  )
}
