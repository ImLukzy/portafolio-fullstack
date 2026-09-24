import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import PortfolioPage from './site/PortfolioPage.jsx'

// El CMS se descarga solo al entrar a /admin: la landing no carga su código.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<PortfolioPage />} />
    </Routes>
  )
}
