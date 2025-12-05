import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { getTale } from '../data/talesRegistry'

export default function TaleLanding() {
  const { taleId } = useParams() // On récupère l'ID depuis l'URL
  const [taleData, setTaleData] = useState(null)
  
  const [showCredits, setShowCredits] = useState(false)
  const [visibleChapters, setVisibleChapters] = useState(5)
  const [expandedChapterId, setExpandedChapterId] = useState(null)
  const [isDesktop, setIsDesktop] = useState(false)
  
  const navigate = useNavigate()

  // Chargement des données du Tale
  useEffect(() => {
    const data = getTale(taleId)
    if (!data) {
      navigate('/hub') // Redirection si Tale introuvable
    } else {
      setTaleData(data)
      if (window.innerWidth > 768) setVisibleChapters(data.chapters.length)
    }
  }, [taleId, navigate])

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

  if (!taleData) return <div className="page pre-hub-page">Chargement...</div>

  // Raccourcis pour le rendu
  const { title, subtitle, description, cover, credits, chapters } = taleData
  const displayedChapters = isDesktop ? chapters : chapters.slice(0, visibleChapters)

  const handleChapterClick = (chapterId) => {
    if (isDesktop) {
      navigate(`/lecture/${taleId}/${chapterId}`)
    } else {
      setExpandedChapterId(expandedChapterId === chapterId ? null : chapterId)
    }
  }

  const openCredits = () => setShowCredits(true)
  const closeCredits = () => setShowCredits(false)

  return (
    <div className="page pre-hub-page">
      <div className="pre-hub">
        <div className="pre-hub__inner">
          
          {/* --- HERO SECTION --- */}
          <div className="pre-hub__hero">
            <div className="pre-hub__hero-grid">
              <div className="pre-hub__media stagger-item delay-1">
                <div className="pre-hub__poster">
                  <img src={cover} alt={title} />
                </div>
              </div>

              <div className="pre-hub__hero-text">
                <h1 className="pre-hub__novel-title stagger-item delay-2">{subtitle || title}</h1>
                <p className="pre-hub__lead stagger-item delay-3">{description}</p>
                
                {/* Bouton Lecture Chapitre 1 par défaut */}
                <Link to={`/lecture/${taleId}/${chapters[0].id}`} className="pre-hub__cta stagger-item delay-4">
                  Commencer l'écoute
                </Link>

                {/* --- CRÉDITS --- */}
                <div className="pre-hub__credits-section stagger-item delay-4">
                  {isDesktop ? (
                    <div className="pre-hub__credits-grid-desktop">
                      {credits.creative.map((credit, i) => (
                        <div key={i} className="pre-hub__credit-card-desktop">
                          <h3 className="pre-hub__credit-head">{credit.title}</h3>
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
                          {credits.voices.slice(0, 3).map((v, i) => (
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
                        {credits.creative[0].people.map((p, i) => (
                          <li key={i} className="pre-hub__credit-line">
                            <span className="pre-hub__credit-name">{p.name}</span>
                            <span className="pre-hub__credit-role">{p.role}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pre-hub__credit-more-container"><span className="pre-hub__credit-more">Afficher plus</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- LISTE DES CHAPITRES --- */}
          <section className="pre-hub__pane pre-hub__pane--chapters">
            <div className="pre-hub__chapter-list">
              {displayedChapters.map((chapter) => {
                const isExpanded = expandedChapterId === chapter.id
                return (
                  <article
                    key={chapter.id}
                    className={`pre-hub__chapter-card pre-hub__chapter-card--list ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => handleChapterClick(chapter.id)}
                  >
                    <div className="pre-hub__chapter-thumb" style={{ backgroundImage: `url('${chapter.cover}')` }}>
                      {isDesktop && <span className="pre-hub__chapter-badge">{chapter.id}</span>}
                      {!isDesktop && <div className="pre-hub__chapter-thumb-overlay">▶</div>}
                    </div>

                    <div className="pre-hub__chapter-content">
                      <div className="pre-hub__chapter-header-mobile">
                        <div className="pre-hub__chapter-texts">
                          <p className="pre-hub__chapter-title">{chapter.title}</p>
                        </div>
                        {!isDesktop && <span className="pre-hub__chapter-badge pre-hub__chapter-badge--mobile">#{chapter.id}</span>}
                      </div>
                      
                      <div className={`pre-hub__chapter-details ${isDesktop || isExpanded ? 'visible' : ''}`}>
                        <p className="pre-hub__chapter-desc">{chapter.summary}</p>
                        {!isDesktop && (
                          <Link 
                            to={`/lecture/${taleId}/${chapter.id}`}
                            className="pre-hub__chapter-play-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Lire
                          </Link>
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
              {credits.creative.map((c, i) => (
                <div key={i} className="credits-overlay__card">
                  <h3 className="credits-overlay__card-title">{c.title}</h3>
                  <ul>{c.people.map((p, j) => <li key={j}>{p.name} - {p.role}</li>)}</ul>
                </div>
              ))}
            </div>
            <div className="credits-overlay__voices">
              <h3>Comédiens</h3>
              <ul>{credits.voices.map((v, i) => <li key={i}>{v.name} - {v.role}</li>)}</ul>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
