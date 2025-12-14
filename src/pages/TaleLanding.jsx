import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../supabase/AuthContext.jsx'

export default function TaleLanding() {
  const { taleId } = useParams() // On récupère le SLUG depuis l'URL
  const location = useLocation()
  const [error, setError] = useState(null)
  const [chapterNotice, setChapterNotice] = useState(null)
  
  // Initialisation avec les données passées par le Link si disponibles
  const [taleData, setTaleData] = useState(() => {
    const stateTale = location.state?.tale
    if (!stateTale) return null

    // Nettoyage de l'image : on ignore les liens Wix pour éviter le flash de l'ancienne cover
    const rawCover = stateTale.cover_image || stateTale.cover_url
    let finalCover = rawCover

    if (rawCover && rawCover.includes('wixstatic')) {
      finalCover = null // On force le null pour que le fetch prenne le relais proprement
    } else if (rawCover && !rawCover.startsWith('http')) {
      finalCover = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${rawCover.split('/').map(part => encodeURIComponent(part)).join('/')}`
    }

    return { 
      ...stateTale, 
      cover: finalCover,
      description: stateTale.synopsis,
      credits: stateTale.credits || { creative: [], voices: [] },
      chapters: [] 
    }
  })

  // Si on a détecté une donnée "sale" (Wix) dans le state, on force le loading pour masquer l'affichage temporaire
  const hasStaleData = location.state?.tale && (location.state.tale.cover_image || location.state.tale.cover_url || '').includes('wixstatic')
  const [loading, setLoading] = useState(!location.state?.tale || hasStaleData)
  
  const [showCredits, setShowCredits] = useState(false)
  const [visibleChapters, setVisibleChapters] = useState(5)
  const [expandedChapterId, setExpandedChapterId] = useState(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [hasPurchase, setHasPurchase] = useState(false)
  const [checkingPurchase, setCheckingPurchase] = useState(false)
  const { user } = useAuth()
  
  const navigate = useNavigate()

  // Chargement des données du Tale depuis Supabase
  useEffect(() => {
    if (!taleId) {
      setLoading(false)
      return
    }

    async function fetchTaleData() {
      try {
        setError(null)
        // 1. Récupérer le Tale via son slug
        const { data: tale, error: taleError } = await supabase
          .from('tales')
          .select('*')
          .eq('slug', taleId)
          .single()

        if (taleError || !tale) {
          console.error('Tale not found:', taleError)
          setError("Impossible de trouver ce Tale ou il n'est pas disponible.")
          return
        }

        // 2. Récupérer les chapitres associés
        const { data: chapters, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('tale_id', tale.id)
          .order('chapter_number', { ascending: true })

        if (chaptersError) {
          console.error('Error fetching chapters:', chaptersError)
          setError("Les chapitres de ce Tale sont indisponibles pour le moment.")
        }

        // 3. Structurer les données pour l'affichage
        const coverSource = tale.cover_image || tale.cover_url;
        const formattedData = {
          ...tale,
          cover: coverSource && !coverSource.startsWith('http') 
            ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${coverSource.split('/').map(part => encodeURIComponent(part)).join('/')}` 
            : coverSource,
          description: tale.synopsis, // Mapping
          credits: tale.credits || { creative: [], voices: [] }, // Fallback si vide
          chapters: chapters || []
        }

        setTaleData(formattedData)
        if (window.innerWidth > 768) setVisibleChapters(formattedData.chapters.length)

      } catch (error) {
        console.error('Error in fetchTaleData:', error)
        setError("Impossible de charger ce Tale pour le moment.")
      } finally {
        setLoading(false)
      }
    }

    fetchTaleData()
  }, [taleId, navigate])

  // Vérifie si l'utilisateur a acheté le Tale (déverrouille les chapitres premium)
  useEffect(() => {
    async function checkPurchase() {
      if (!taleData?.id || !user) {
        setHasPurchase(false)
        return
      }
      setCheckingPurchase(true)
      const { data, error } = await supabase
        .from('purchases')
        .select('id')
        .eq('tale_id', taleData.id)
        .eq('user_id', user.id)
        .limit(1)

      if (error) {
        console.error('Error checking purchase:', error)
        setHasPurchase(false)
      } else {
        setHasPurchase(!!data?.length)
      }
      setCheckingPurchase(false)
    }
    checkPurchase()
  }, [taleData?.id, user])

  // Gestion Resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768
      setIsDesktop(desktop)
      if (desktop && taleData) setVisibleChapters(taleData.chapters.length)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [taleData])

  // Gestion Touche Echap pour crédits
  useEffect(() => {
    if (!showCredits) return
    const handleKeyDown = (e) => { if (e.key === 'Escape') setShowCredits(false) }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCredits])

  // Bloque le scroll de fond quand l'overlay crédits est ouvert pour éviter une double barre de scroll
  useEffect(() => {
    if (showCredits) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showCredits])

  if (loading) return <div className="page pre-hub-page" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>Chargement du Tale...</div>
  if (!taleData) return (
    <div className="page pre-hub-page" style={{ padding: '120px 20px', textAlign: 'center' }}>
      <p style={{ marginBottom: '16px' }}>{error || "Ce Tale est introuvable ou temporairement indisponible."}</p>
      <Link to="/hub" className="pre-hub__cta">Retour au catalogue</Link>
    </div>
  )

  // Raccourcis pour le rendu
  const { title, subtitle, description, cover, credits, chapters } = taleData
  const displayedChapters = isDesktop ? chapters : chapters.slice(0, visibleChapters)

  const handleChapterClick = (chapter, forcePlay = false) => {
    const locked = chapter.is_premium && !hasPurchase
    if (locked) {
      setChapterNotice(!user
        ? 'Connexion requise pour accéder aux chapitres premium.'
        : 'Achetez ce Tale pour accéder aux chapitres premium.')
      return
    }
    setChapterNotice(null)
    if (isDesktop || forcePlay) {
      enterFullscreen()
      navigate(`/lecture/${taleId}/${chapter.id}`)
    } else {
      setExpandedChapterId(expandedChapterId === chapter.id ? null : chapter.id)
    }
  }

  const openCredits = () => setShowCredits(true)
  const closeCredits = () => setShowCredits(false)

  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`)
      })
    }
  }

  return (
    <div className="page pre-hub-page page--fade">
      <div className="pre-hub">
        <div className="pre-hub__inner">
          
          {error && (
            <div
              role="alert"
              style={{
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.5)',
                color: '#fecaca',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '16px'
              }}
            >
              {error}
            </div>
          )}

          {/* --- HERO SECTION --- */}
          <div className="pre-hub__hero">
            <div className="pre-hub__hero-grid">
              <div className="pre-hub__media">
                <div className="pre-hub__poster">
                  <img 
                    src={cover} 
                    alt={title} 
                    loading="eager"
                    onError={(e) => {e.target.src = 'https://placehold.co/600x900/1a1a1a/ffffff?text=No+Cover'}}
                  />
                </div>
              </div>

              <div className="pre-hub__hero-text">
                <h1 className="pre-hub__novel-title stagger-item delay-2">{title}</h1>
                <p className="pre-hub__lead stagger-item delay-3">{description}</p>
                
                {/* Bouton Lecture Chapitre 1 par défaut */}
                {chapters.length > 0 && (
                  <Link 
                    to={`/lecture/${taleId}/${chapters[0].id}`} 
                    className="pre-hub__cta stagger-item delay-4"
                    onClick={enterFullscreen}
                  >
                    Commencer l'écoute
                  </Link>
                )}

                {/* --- CRÉDITS --- */}
                <div className="pre-hub__credits-section stagger-item delay-4">
                  {isDesktop ? (
                    <div className="pre-hub__credits-grid-desktop">
                      {credits.creative && credits.creative.map((credit, i) => (
                        <div key={i} className="pre-hub__credit-card-desktop">
                          <h3 className="pre-hub__credit-head">{credit.title === 'Production' ? 'Illustration' : credit.title}</h3>
                          <ul className="pre-hub__credit-lines">
                            {credit.people.map((p, j) => (
                              <li key={j} className="pre-hub__credit-line">
                                <span className="pre-hub__credit-name">{p.name}</span>
                                <span className="pre-hub__credit-role">{p.role}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="pre-hub__credit-card-desktop">
                        <h3 className="pre-hub__credit-head">Comédiens</h3>
                        <ul className="pre-hub__credit-lines">
                          {credits.voices && credits.voices.slice(0, 3).map((v, i) => (
                            <li key={i} className="pre-hub__credit-line">
                              <span className="pre-hub__credit-name">{v.name}</span>
                              <span className="pre-hub__credit-role">{v.role}</span>
                            </li>
                          ))}
                        </ul>
                        <button className="pre-hub__credit-more-link" onClick={openCredits}>
                          Voir tous les talents
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pre-hub__credit-stack" onClick={openCredits}>
                      <div className="pre-hub__credit-stack__head"><h3 className="pre-hub__credit-head">Crédits</h3></div>
                      <ul className="pre-hub__credit-lines">
                        {credits.creative && credits.creative.slice(0, 2).map((group) => 
                          group.people.map((p, i) => (
                            <li key={`${group.title}-${i}`} className="pre-hub__credit-line">
                              <span className="pre-hub__credit-name">{p.name}</span>
                              <span className="pre-hub__credit-role">{p.role}</span>
                            </li>
                          ))
                        )}
                      </ul>
                      <div className="pre-hub__credit-more-container"><span className="pre-hub__credit-more">Afficher plus</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {chapterNotice && (
            <div
              role="status"
              style={{
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.5)',
                color: '#facc15',
                padding: '12px 16px',
                borderRadius: '10px',
                margin: '12px 0 0'
              }}
            >
              {chapterNotice}
            </div>
          )}

          {/* --- LISTE DES CHAPITRES --- */}
          <section className="pre-hub__pane pre-hub__pane--chapters">
            <div className="pre-hub__chapter-list">
              {displayedChapters.map((chapter) => {
                const isExpanded = expandedChapterId === chapter.id
                const isLocked = chapter.is_premium && !hasPurchase
                
                // Logique d'image de chapitre (Supabase ou Fallback Tale)
                let chapterImage = chapter.cover_image || cover;
                if (chapterImage && !chapterImage.startsWith('http')) {
                   chapterImage = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${chapterImage.split('/').map(part => encodeURIComponent(part)).join('/')}`;
                }

                return (
                  <article
                    key={chapter.id}
                    className={`pre-hub__chapter-card pre-hub__chapter-card--list ${isExpanded ? 'expanded' : ''} ${isLocked ? 'chapter-locked' : ''}`}
                    onClick={() => handleChapterClick(chapter)}
                  >
                    <div 
                      className="pre-hub__chapter-thumb" 
                      style={{ backgroundImage: `url('${chapterImage}')` }}
                      onClick={(e) => {
                        if (!isDesktop) {
                          e.stopPropagation()
                          handleChapterClick(chapter, true)
                        }
                      }}
                    >
                      {isDesktop && <span className="pre-hub__chapter-badge">{chapter.chapter_number}</span>}
                    </div>

                    <div className="pre-hub__chapter-content">
                      <div className="pre-hub__chapter-header-mobile">
                        <div className="pre-hub__chapter-texts">
                          <p className="pre-hub__chapter-title">{chapter.title}</p>
                          {chapter.is_premium && (
                            <span style={{ color: '#f59e0b', fontSize: '0.85rem', marginLeft: '8px' }}>Premium</span>
                          )}
                        </div>
                        {!isDesktop && <span className="pre-hub__chapter-badge pre-hub__chapter-badge--mobile">#{chapter.chapter_number}</span>}
                      </div>
                      
                      <div className={`pre-hub__chapter-details ${isDesktop || isExpanded ? 'visible' : ''}`}>
                        <p className="pre-hub__chapter-desc">{chapter.description || 'Aucune description disponible.'}</p>
                        {!isDesktop && isLocked && (
                          <button
                            className="pre-hub__chapter-play-btn"
                            onClick={(e) => { e.stopPropagation(); handleChapterClick(chapter) }}
                            style={{ backgroundColor: '#f59e0b', color: '#0a0a0a' }}
                          >
                            {user ? 'Acheter' : 'Connexion requise'}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

        </div>
      </div>

      {/* --- OVERLAY CRÉDITS --- */}
      {showCredits && createPortal(
        <div className="credits-overlay" onClick={closeCredits}>
          <div className="credits-overlay__panel" onClick={(e) => e.stopPropagation()}>
            <div className="credits-overlay__head">
              <h2 className="credits-overlay__title">Crédits complets</h2>
              <button className="credits-overlay__close" onClick={closeCredits}>Fermer</button>
            </div>
            <div className="credits-overlay__grid">
              {credits.creative && credits.creative.map((c, i) => (
                <div key={i} className="credits-overlay__card">
                  <h3 className="credits-overlay__card-title">{c.title}</h3>
                  <ul>{c.people.map((p, j) => <li key={j}>{p.name} - {p.role}</li>)}</ul>
                </div>
              ))}
            </div>
            <div className="credits-overlay__voices">
              <h3>Comédiens</h3>
              <ul>{credits.voices && credits.voices.map((v, i) => <li key={i}>{v.name} - {v.role}</li>)}</ul>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
