import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'

export default function NotFoundPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="text-6xl mb-4">🍼</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 mb-6">
          La página que buscas no existe o el enlace es incorrecto.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-green-400 text-white rounded-xl font-medium hover:bg-green-500 transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </AppShell>
  )
}
