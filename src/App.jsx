import { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout.jsx'
import Accueil from './pages/Accueil.jsx'
import Hub from './pages/Hub.jsx'
import Liseuse from './pages/Liseuse.jsx'
import CreerTale from './pages/CreerTale.jsx'

// Composant utilitaire pour remonter en haut de page à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Route Layout : Pour toutes les pages "marketing" et navigation */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/hub" element={<Hub />} />
          <Route path="/creer-tale" element={<CreerTale />} />
        </Route>

        {/* Route Standalone : La liseuse vit sa propre vie sans le header/footer du site */}
        <Route path="/liseuse" element={<Liseuse />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
