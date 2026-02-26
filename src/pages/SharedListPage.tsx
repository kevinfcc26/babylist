import { useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Spinner from '../components/shared/Spinner'
import EmptyState from '../components/shared/EmptyState'
import ListProgressBar from '../components/list/ListProgressBar'
import CategoryFilter from '../components/list/CategoryFilter'
import ItemGrid from '../components/list/ItemGrid'
import SuggestItemForm from '../components/list/SuggestItemForm'
import { useList } from '../hooks/useList'
import type { Category } from '../types/list'

export default function SharedListPage() {
  const { shareCode } = useParams<{ shareCode: string }>()
  const { list, items, loading, error, refresh } = useList(shareCode ?? '')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showSuggest, setShowSuggest] = useState(false)

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-64">
          <Spinner size="lg" />
        </div>
      </AppShell>
    )
  }

  if (error || !list) {
    return (
      <AppShell>
        <EmptyState
          title="Lista no encontrada"
          description="El código que usaste no corresponde a ninguna lista. Verifica el enlace e intenta de nuevo."
        />
      </AppShell>
    )
  }

  const filteredItems = selectedCategory
    ? items.filter((i) => i.category === selectedCategory)
    : items

  const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1
    return acc
  }, {})

  const purchased = items.filter((i) => i.isPurchased).length
  const reserved = items.filter((i) => i.isReserved && !i.isPurchased).length

  return (
    <AppShell>
      <PageHeader
        title={list.title}
        subtitle={`Lista de ${list.ownerName} · Bebé: ${list.babyName}`}
      />

      <div className="mt-6">
        <ListProgressBar
          total={items.length}
          purchased={purchased}
          reserved={reserved}
        />
      </div>

      <div className="mt-6">
        <CategoryFilter
          selected={selectedCategory}
          onChange={(c) => setSelectedCategory(c as Category | null)}
          counts={categoryCounts}
        />
      </div>

      <div className="mt-6">
        {filteredItems.length === 0 ? (
          <EmptyState
            title="No hay artículos en esta categoría"
            description="Prueba seleccionando otra categoría o espera a que el dueño añada artículos."
          />
        ) : (
          <ItemGrid
            listId={list.id}
            shareCode={shareCode ?? ''}
            items={filteredItems}
            onMutate={refresh}
          />
        )}
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        {showSuggest ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sugerir un artículo</h3>
            <SuggestItemForm
              listId={list.id}
              shareCode={shareCode ?? ''}
              onSuccess={() => { setShowSuggest(false); refresh() }}
              onCancel={() => setShowSuggest(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSuggest(true)}
            className="w-full md:w-auto px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-pink-400 hover:text-pink-600 transition-colors text-sm font-medium"
          >
            + Sugerir un artículo
          </button>
        )}
      </div>
    </AppShell>
  )
}
