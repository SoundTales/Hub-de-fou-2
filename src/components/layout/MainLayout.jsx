import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Footer from './Footer.jsx'
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from '../../supabase/AuthContext.jsx'
import LoginModal from '../auth/LoginModal'

const navClass = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')

export default function MainLayout() {
  const [headerHidden, setHeaderHidden] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading: authLoading, signInWithEmail, signOut } = useAuth()

  useEffect(() => {
    let lastScrollY = window.scrollY
    let accumulatedDelta = 0
    const SCROLL_THRESHOLD = 60 // Seuil de tolérance pour éviter les sauts

    const handleScroll = () => {
      // Si le menu mobile est ouvert, on force l'affichage du header
      if (mobileMenuOpen) {
        setHeaderHidden(false)
        return
      }

      const currentY = window.scrollY
      const delta = currentY - lastScrollY
      const atTop = currentY <= 20

      // Mise à jour de l'état "en haut de page"
      setIsAtTop(atTop)

      // Si on est tout en haut, on affiche toujours le header
      if (atTop) {
        setHeaderHidden(false)
        accumulatedDelta = 0
        lastScrollY = currentY
        return
      }

      // Gestion de la direction du scroll
      // Si on change de direction, on reset l'accumulateur
      if ((delta > 0 && accumulatedDelta < 0) || (delta < 0 && accumulatedDelta > 0)) {
        accumulatedDelta = 0
      }

      accumulatedDelta += delta

      // Logique d'affichage/masquage avec hystérésis
      if (accumulatedDelta > SCROLL_THRESHOLD && !headerHidden) {
        setHeaderHidden(true) // On descend -> on cache
        accumulatedDelta = 0
      } else if (accumulatedDelta < -SCROLL_THRESHOLD && headerHidden) {
        setHeaderHidden(false) // On remonte -> on affiche
        accumulatedDelta = 0
      }

      lastScrollY = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen, headerHidden])

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const isOpen = !prev
      // Si on ouvre le menu alors que le header était caché, on le montre
      if (isOpen) setHeaderHidden(false)
      return isOpen
    })
  }
  
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const toggleFavorite = () => setIsFavorite((prev) => !prev)

  const handleResumeClick = () => navigate('/liseuse')

  const handleAuthClick = async () => {
    if (authLoading) return
    if (user) {
      await signOut()
      setAuthMessage('Déconnecté.')
      return
    }
    setShowLoginModal(true)
  }

  // On affiche la barre du bas uniquement sur le Hub pour l'instant
  const shouldShowBottomBar = location.pathname.startsWith('/hub')

  // Liste des liens pour éviter la duplication
  const NavLinks = () => (
    <>
      <NavLink to="/" end className={navClass} onClick={closeMobileMenu}>
        Accueil
      </NavLink>
      <NavLink to="/hub" className={navClass} onClick={closeMobileMenu}>
        Hub
      </NavLink>
      <NavLink to="/liseuse" className={navClass} onClick={closeMobileMenu}>
        Liseuse (Démo)
      </NavLink>
      <NavLink to="/creer-tale" className={navClass} onClick={closeMobileMenu}>
        Créer un Tale
      </NavLink>
    </>
  )

  return (
    <div className={`app-shell ${shouldShowBottomBar ? 'app-shell--with-bottom-bar' : ''}`}>
      <header
        className={`app-header ${headerHidden ? 'app-header--hidden' : ''} ${
          !isAtTop ? 'app-header--solid' : ''
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
        
        <NavLink to="/" className="app-logo" aria-label="Retour à l'accueil" onClick={closeMobileMenu}>
          <img src={logoSrc} alt="" loading="lazy" />
        </NavLink>

        {/* Navigation Desktop (cachée sur mobile via CSS) */}
        <nav className="app-nav app-nav--desktop">
          <NavLinks />
        </nav>

        <button type="button" className="app-login-btn" onClick={() => { closeMobileMenu(); handleAuthClick() }}>
          {user ? 'Déconnexion' : 'Connexion / Inscription'}
        </button>
      </header>

      {authMessage && (
        <div style={{ position: 'fixed', top: '70px', right: '20px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '8px 12px', borderRadius: '8px', zIndex: 2000 }}>
          {user && <strong>{user.email}</strong>} {authMessage}
        </div>
      )}

      {/* Navigation Mobile (Overlay séparé du header pour éviter les bugs d'affichage) */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'mobile-menu-overlay--open' : ''}`}>
        <nav className="mobile-menu-nav">
          <NavLinks />
        </nav>
      </div>

      <main className={`app-main ${shouldShowBottomBar ? 'app-main--with-bottom' : ''}`}>
        <Outlet />
      </main>

      {/* Le footer est maintenant toujours affiché */}
      <Footer />

      {shouldShowBottomBar && (
        <div className={`mobile-bottom-bar ${headerHidden ? 'mobile-bottom-bar--hidden' : ''}`} aria-label="Barre de lecture">
          <button
            type="button"
            className={`mobile-bottom-bar__icon-btn ${isFavorite ? 'mobile-bottom-bar__icon-btn--active' : ''}`}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={isFavorite}
            onClick={toggleFavorite}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          
          <button type="button" className="mobile-bottom-bar__resume-btn" onClick={handleResumeClick}>
            <span className="mobile-bottom-bar__play-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <div className="mobile-bottom-bar__text-group">
              <span className="mobile-bottom-bar__label">Reprendre</span>
              <span className="mobile-bottom-bar__sub">Chapitre 1 · 12min</span>
            </div>
          </button>
        </div>
      )}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}
