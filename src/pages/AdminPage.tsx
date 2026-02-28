import { useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Spinner from '../components/shared/Spinner'
import EmptyState from '../components/shared/EmptyState'
import ListProgressBar from '../components/list/ListProgressBar'
import CategoryFilter from '../components/list/CategoryFilter'
import ShareLinkPanel from '../components/admin/ShareLinkPanel'
import AdminLinkPanel from '../components/admin/AdminLinkPanel'
import SheetsSyncStatus from '../components/admin/SheetsSyncStatus'
import ItemForm from '../components/admin/ItemForm'
import ItemTable from '../components/admin/ItemTable'
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal'
import Button from '../components/shared/Button'
import { useAdminList } from '../hooks/useAdminList'
import { deleteItem } from '../services/items'
import type { Category, ListItem } from '../types/list'

export default function AdminPage() {
  const { adminCode } = useParams<{ adminCode: string }>()
  const { list, items, loading, error, refresh } = useAdminList(adminCode ?? '')

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ListItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<ListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
          title="Acceso no autorizado"
          description="El código de administrador no es válido o la lista no existe."
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

  const reserved = items.filter((i) => i.isReserved).length

  async function handleDelete() {
    if (!deletingItem || !list || !adminCode) return
    setDeleteLoading(true)
    try {
      await deleteItem(list.id, deletingItem.id, adminCode)
      setDeletingItem(null)
      refresh()
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title={list.title}
        subtitle={`Administración · ${list.ownerName}`}
        action={
          <Button onClick={() => { setEditingItem(null); setShowItemForm(true) }} size="sm">
            + Añadir artículo
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ShareLinkPanel shareCode={list.shareCode} />
        <AdminLinkPanel adminCode={adminCode ?? ''} />
        <SheetsSyncStatus googleSheetId={list.googleSheetId} listId={list.id} />
      </div>

      <div className="mt-6">
        <ListProgressBar
          total={items.length}
          reserved={reserved}
        />
      </div>

      {(showItemForm || editingItem) && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingItem ? 'Editar artículo' : 'Nuevo artículo'}
          </h3>
          <ItemForm
            listId={list.id}
            adminCode={adminCode ?? ''}
            item={editingItem ?? undefined}
            onSuccess={() => { setShowItemForm(false); setEditingItem(null); refresh() }}
            onCancel={() => { setShowItemForm(false); setEditingItem(null) }}
          />
        </div>
      )}

      <div className="mt-6">
        <CategoryFilter
          selected={selectedCategory}
          onChange={(c) => setSelectedCategory(c as Category | null)}
          counts={categoryCounts}
        />
      </div>

      <div className="mt-4">
        {filteredItems.length === 0 ? (
          <EmptyState
            title="No hay artículos todavía"
            description="Añade artículos usando el botón de arriba."
            action={
              <Button onClick={() => setShowItemForm(true)}>
                + Añadir primer artículo
              </Button>
            }
          />
        ) : (
          <ItemTable
            items={filteredItems}
            onEdit={(item) => { setEditingItem(item); setShowItemForm(false) }}
            onDelete={(item) => setDeletingItem(item)}
          />
        )}
      </div>

      <DeleteConfirmModal
        item={deletingItem}
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AppShell>
  )
}
