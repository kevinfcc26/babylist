import { useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import Spinner from '../components/shared/Spinner'
import EmptyState from '../components/shared/EmptyState'
import CategoryFilter from '../components/list/CategoryFilter'
import ItemGrid from '../components/list/ItemGrid'
import SuggestItemForm from '../components/list/SuggestItemForm'
import BabyShowerBanner from '../components/list/BabyShowerBanner'
import { useList } from '../hooks/useList'
import type { Category } from '../types/list'

function BranchLeft() {
  return (
    <svg viewBox="0 0 110 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M8,8 Q28,55 52,140" stroke="#7aaa6a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M8,8 Q-4,28 10,38 Q26,32 18,14 Q14,6 8,8Z" fill="#a8c89a" opacity="0.8" />
      <path d="M18,30 Q4,46 14,58 Q32,56 30,38 Q26,26 18,30Z" fill="#8fbc7e" opacity="0.75" />
      <path d="M26,52 Q40,44 44,58 Q40,72 26,66 Q20,60 26,52Z" fill="#b0cc9a" opacity="0.72" />
      <path d="M34,75 Q20,85 24,99 Q40,101 44,87 Q44,73 34,75Z" fill="#a0be8a" opacity="0.75" />
      <path d="M44,97 Q58,91 62,105 Q58,119 44,113 Q36,107 44,97Z" fill="#b8d0a0" opacity="0.65" />
      <path d="M20,60 Q8,66 8,80 Q22,84 28,70 Q28,62 20,60Z" fill="#c0d8a8" opacity="0.6" />
      <path d="M48,118 Q38,130 42,144 Q56,146 58,132 Q58,120 48,118Z" fill="#a8c89a" opacity="0.6" />
    </svg>
  )
}

function BranchRight() {
  return (
    <svg viewBox="0 0 110 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M102,8 Q82,55 58,140" stroke="#7aaa6a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M102,8 Q114,28 100,38 Q84,32 92,14 Q96,6 102,8Z" fill="#a8c89a" opacity="0.8" />
      <path d="M92,30 Q106,46 96,58 Q78,56 80,38 Q84,26 92,30Z" fill="#8fbc7e" opacity="0.75" />
      <path d="M84,52 Q70,44 66,58 Q70,72 84,66 Q90,60 84,52Z" fill="#b0cc9a" opacity="0.72" />
      <path d="M76,75 Q90,85 86,99 Q70,101 66,87 Q66,73 76,75Z" fill="#a0be8a" opacity="0.75" />
      <path d="M66,97 Q52,91 48,105 Q52,119 66,113 Q74,107 66,97Z" fill="#b8d0a0" opacity="0.65" />
      <path d="M90,60 Q102,66 102,80 Q88,84 82,70 Q82,62 90,60Z" fill="#c0d8a8" opacity="0.6" />
      <path d="M62,118 Q72,130 68,144 Q54,146 52,132 Q52,120 62,118Z" fill="#a8c89a" opacity="0.6" />
    </svg>
  )
}

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

  return (
    <AppShell>
      {/* Single panel that wraps everything — welcome + list */}
      <div className="relative bg-white rounded-3xl border border-green-100 shadow-md overflow-hidden">

        {/* Botanical corners — top */}
        <div className="absolute top-0 left-0 w-36 h-52 opacity-80 pointer-events-none z-0">
          <BranchLeft />
        </div>
        <div className="absolute top-0 right-0 w-36 h-52 opacity-80 pointer-events-none z-0">
          <BranchRight />
        </div>
        {/* Botanical corners — bottom */}
        <div className="absolute bottom-0 left-0 w-36 h-52 opacity-80 pointer-events-none z-0 rotate-180">
          <BranchRight />
        </div>
        <div className="absolute bottom-0 right-0 w-36 h-52 opacity-80 pointer-events-none z-0 rotate-180">
          <BranchLeft />
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-6">

          {/* Top animals */}
          <div className="flex justify-between items-end mb-3 select-none">
            <span className="text-2xl tracking-wide">🦊🐻🦝</span>
            <span className="text-2xl">🦌</span>
          </div>

          {/* Welcome section */}
          <BabyShowerBanner list={list} />

          {/* Divider */}
          <div className="border-t border-gray-100 my-6" />

          {/* Add item — above categories */}
          {showSuggest ? (
            <div className="bg-green-50 rounded-2xl border border-green-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar un artículo</h3>
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
              className="w-full py-3 mb-6 bg-green-400 text-white rounded-xl text-sm font-semibold hover:bg-green-500 transition-colors"
            >
              + Agregar un artículo
            </button>
          )}

          {/* Category filter */}
          <CategoryFilter
            selected={selectedCategory}
            onChange={(c) => setSelectedCategory(c as Category | null)}
            counts={categoryCounts}
          />

          {/* Item grid */}
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

          {/* Bottom animals */}
          <div className="flex justify-between items-start mt-6 select-none">
            <span className="text-2xl tracking-wide">🦊🐻🦝</span>
            <span className="text-2xl">🦌</span>
          </div>

        </div>
      </div>
    </AppShell>
  )
}
