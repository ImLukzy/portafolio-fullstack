import { lazy, Suspense, useLayoutEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import PortfolioPage from './site/PortfolioPage.jsx'

// El CMS se descarga solo al entrar a /admin: la landing no carga su código.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

export const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/')

export default function App() {
  const { pathname } = useLocation()

  // Mantiene la escala del sitio público (styles.css → html.site-scale) al navegar
  // dentro de la SPA. El primer pintado ya lo resuelve el script de index.html.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('site-scale', !isAdminPath(pathname))
  }, [pathname])

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
