import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Accueil from './pages/Accueil.jsx'
import Hub from './pages/Hub.jsx'
import Liseuse from './pages/Liseuse.jsx'

const navClass = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')

export default function App() {
  const [headerHidden, setHeaderHidden] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let lastScrollY = window.scrollY
    let accumulatedDelta = 0
    const SCROLL_DELTA = 24

    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY

      if (currentY <= 4) {
        setHeaderHidden(false)
        setIsAtTop(true)
        accumulatedDelta = 0
        lastScrollY = currentY
        return
      }

      accumulatedDelta += delta

      if (accumulatedDelta > SCROLL_DELTA) {
        setHeaderHidden(true)
        setIsAtTop(false)
        accumulatedDelta = 0
      } else if (accumulatedDelta < -SCROLL_DELTA) {
        setHeaderHidden(false)
        accumulatedDelta = 0
      }

      lastScrollY = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => setMobileMenuOpen((value) => !value)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const shouldShowBottomBar = location.pathname.startsWith('/hub')

  return (
    <div className="app-shell">
      <header
        className={`app-header ${headerHidden ? 'app-header--hidden' : ''} ${
          !isAtTop && !headerHidden ? 'app-header--solid' : ''
        }`}
      >
        <button
          type="button"
          className={`app-menu-btn ${mobileMenuOpen ? 'app-menu-btn--active' : ''}`}
          aria-label="Afficher les pages"
          aria-expanded={mobileMenuOpen}
          onClick={toggleMobileMenu}
        >
          <span />
          <span />
          <span />
        </button>
        <NavLink to="/" className="app-logo" aria-label="Retour à l'accueil">
          <img src="/logo.svg" alt="" loading="lazy" />
        </NavLink>
        <nav className={`app-nav ${mobileMenuOpen ? 'app-nav--mobile-open' : ''}`}>
          <NavLink to="/" end className={navClass} onClick={closeMobileMenu}>
            Accueil
          </NavLink>
          <NavLink to="/hub" className={navClass} onClick={closeMobileMenu}>
            Hub
          </NavLink>
          <NavLink to="/liseuse" className={navClass} onClick={closeMobileMenu}>
            Liseuse
          </NavLink>
        </nav>
        <button type="button" className="app-login-btn">
          Connexion
        </button>
      </header>

      <main className={`app-main ${shouldShowBottomBar ? 'app-main--with-bottom' : ''}`}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/hub" element={<Hub />} />
          <Route path="/liseuse" element={<Liseuse />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {shouldShowBottomBar && (
        <div className={`mobile-bottom-bar ${headerHidden ? 'mobile-bottom-bar--hidden' : ''}`} aria-label="Navigation">
          <button type="button" className="mobile-bottom-bar__btn mobile-bottom-bar__btn--home" aria-label="Accueil">
            <span aria-hidden="true" className="mobile-bottom-bar__icon">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5.5a.5.5 0 0 1-.5-.5V15h-4v5.5a.5.5 0 0 1-.5.5H4a1 1 0 0 1-1-1v-8.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="sr-only">Accueil</span>
          </button>
          <button type="button" className="mobile-bottom-bar__btn mobile-bottom-bar__btn--bookmark" aria-label="Signet">
            <span aria-hidden="true" className="mobile-bottom-bar__icon">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M7 3h10a1 1 0 0 1 1 1v17l-6-3-6 3V4a1 1 0 0 1 1-1z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="sr-only">Signet</span>
          </button>
          <button type="button" className="mobile-bottom-bar__btn mobile-bottom-bar__btn--continue">
            Continuer
          </button>
        </div>
      )}
    </div>
  )
}
