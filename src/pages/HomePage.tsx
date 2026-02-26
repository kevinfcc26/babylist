import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import CreateListForm from '../components/home/CreateListForm'
import EnterCodeForm from '../components/home/EnterCodeForm'

export default function HomePage() {
  return (
    <AppShell>
      <PageHeader
        title="Baby Shower Lista"
        subtitle="Crea tu lista de regalos o accede a una existente"
      />
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Crear nueva lista</h2>
          <p className="text-sm text-gray-500 mb-6">
            Configura tu lista de baby shower y compártela con familiares y amigos.
          </p>
          <CreateListForm />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Acceder a una lista</h2>
          <p className="text-sm text-gray-500 mb-6">
            Ingresa el código que te compartieron para ver o administrar una lista.
          </p>
          <EnterCodeForm />
        </div>
      </div>
    </AppShell>
  )
}
