import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SharedListPage from './pages/SharedListPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/list/:shareCode',
    element: <SharedListPage />,
  },
  {
    path: '/manage/:adminCode',
    element: <AdminPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
