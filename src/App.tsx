import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SharedListPage from './pages/SharedListPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

// import.meta.env.BASE_URL is set by Vite to match the `base` config option.
// Locally it's "/", on GitHub Pages it becomes "/babylist/" automatically.
const router = createBrowserRouter(
  [
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
  ],
  { basename: import.meta.env.BASE_URL }
)

export default function App() {
  return <RouterProvider router={router} />
}
