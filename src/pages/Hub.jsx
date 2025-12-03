import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link } from 'react-router-dom'

const CHAPTERS = [
  { id: '1', title: 'Chapitre 1 · Le réveil', summary: 'Malone ouvre les yeux sur une cité qui gronde tandis que Zadig prépare la révolte.', cover: 'https://picsum.photos/seed/osrase1/800/450' },
  { id: '2', title: 'Chapitre 2 · Les machines', summary: 'Le bruit des pistons couvre les conversations. Il faut hurler pour se faire entendre.', cover: 'https://picsum.photos/seed/osrase2/800/450' },
  { id: '3', title: 'Chapitre 3 · Les frères', summary: 'Une alliance inattendue se forme dans les bas-fonds du Secteur 7.', cover: 'https://picsum.photos/seed/osrase3/800/450' },
  { id: '4', title: 'Chapitre 4 · La faille', summary: 'Ils ont trouvé un passage. Reste à savoir ce qui se cache de l’autre côté.', cover: 'https://picsum.photos/seed/osrase4/800/450' },
  { id: '5', title: 'Chapitre 5 · Les cendres', summary: 'Tout ce qui brûle ne disparaît pas forcément. Certaines choses renaissent.', cover: 'https://picsum.photos/seed/osrase5/800/450' },
  { id: '6', title: 'Chapitre 6 · L’ascension', summary: 'La Tour est en vue. Le plus dur commence maintenant.', cover: 'https://picsum.photos/seed/osrase6/800/450' }
]

const BASE_VOICES = [
  { name: 'Dupont Dupond', role: 'Malone' },
  { name: 'Dupont Dupond', role: 'Zadig' },
  { name: 'Dupont Dupond', role: 'Zora' }
]

const EXTRA_VOICES = [
  { name: 'Dupont Dupond', role: 'Albar' },
  { name: 'Dupont Dupond', role: 'Evelyne' },
  { name: 'Dupont Dupond', role: 'Élan' }
]

const CREATIVE_CREDITS = [
  {
    id: 'tale',
    title: 'Tale',
    people: [{ name: 'Johnny Delaveau', role: 'Auteur principal' }]
  },
  {
    id: 'sound',
    title: 'Sound',
    people: [{ name: 'Quentin Querel', role: 'Compositeur principal' }]
  },
  {
    id: 'illustration',
    title: 'Illustration',
    people: [{ name: 'Dupont Dupond', role: 'Illustrateur principal' }]
  }
]

// Crédits simplifiés pour le mobile
const MOBILE_PREVIEW_CREDITS = [
  { name: 'Johnny Delaveau', role: 'Auteur' },
  { name: 'Quentin Querel', role: 'Compositeur' }
]

const ALL_VOICES = [...BASE_VOICES, ...EXTRA_VOICES]
const VOICE_SECTION_TITLE = 'Comédiens voix'

export default function Hub() {
  const [showCredits, setShowCredits] = useState(false)
  const [visibleChapters, setVisibleChapters] = useState(5)
  const [expandedChapterId, setExpandedChapterId] = useState(null)
  const [isDesktop, setIsDesktop] = useState(false)
  
  const navigate = useNavigate()

  const voices = BASE_VOICES
  const allVoices = ALL_VOICES

  const goToLiseuse = () => navigate('/liseuse')
  
  const openCredits = () => setShowCredits(true)
  const closeCredits = () => setShowCredits(false)
  
  const showMoreChapters = () => {
    setVisibleChapters((prev) => prev + 5)
  }

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768
      setIsDesktop(desktop)
      if (desktop) {
        setVisibleChapters(CHAPTERS.length)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleChapterClick = (id) => {
    if (isDesktop) {
      goToLiseuse()
    } else {
      setExpandedChapterId(expandedChapterId === id ? null : id)
    }
  }

  const handleCardKeyDown = (event, id) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleChapterClick(id)
    }
  }

  useEffect(() => {
    if (!showCredits) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowCredits(false)
    }
    const previousOverflow = typeof document !== 'undefined' ? document.body.style.overflow : ''
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (typeof document !== 'undefined') document.body.style.overflow = previousOverflow
    }
  }, [showCredits])

  const displayedChapters = isDesktop ? CHAPTERS : CHAPTERS.slice(0, visibleChapters)

  return (
    <div className="page pre-hub-page">
      <div className="pre-hub">
        <div className="pre-hub__inner">
          <div className="pre-hub__hero">
            <div className="pre-hub__hero-grid">
              <div className="pre-hub__media stagger-item delay-1">
                <div className="pre-hub__poster">
                  <img
                    src="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1000&auto=format&fit=crop"
                    alt="Affiche The Last Horizon"
                  />
                </div>
              </div>

              <div className="pre-hub__hero-text">
                <h1 className="pre-hub__novel-title stagger-item delay-2">The Last Horizon</h1>
                <p className="pre-hub__lead stagger-item delay-3">
                  Dans un futur où le silence est devenu la ressource la plus précieuse, une archiviste découvre un
                  enregistrement qui pourrait changer l'histoire de l'humanité. Une épopée sonore immersive.
                </p>
                <Link to="/liseuse" className="pre-hub__cta stagger-item delay-4">
                  Commencer l'écoute
                </Link>

                {/* SECTION CRÉDITS : Déplacée ici pour être dans la colonne de droite */}
                <div className="pre-hub__credits-section stagger-item delay-4">
                  {isDesktop ? (
                    /* VERSION DESKTOP : Grille complète */
                    <div className="pre-hub__credits-grid-desktop">
                      {CREATIVE_CREDITS.map((credit) => (
                        <div key={credit.id} className="pre-hub__credit-card-desktop">
                          <h3 className="pre-hub__credit-head">{credit.title}</h3>
                          <ul className="pre-hub__credit-lines">
                            {credit.people.map((p, i) => (
                              <li key={i} className="pre-hub__credit-line">
                                <span className="pre-hub__credit-name">{p.name}</span>
                                <span className="pre-hub__credit-role">{p.role}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="pre-hub__credit-card-desktop">
                        <h3 className="pre-hub__credit-head">{VOICE_SECTION_TITLE}</h3>
                        <ul className="pre-hub__credit-lines">
                          {voices.map((v, i) => (
                            <li key={i} className="pre-hub__credit-line">
                              <span className="pre-hub__credit-name">{v.name}</span>
                              <span className="pre-hub__credit-role">{v.role}</span>
                            </li>
                          ))}
                        </ul>
                        <button className="pre-hub__credit-more-link" onClick={openCredits}>
                          Voir tous les {allVoices.length} talents
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VERSION MOBILE : Carte unique résumée */
                    <div
                      className="pre-hub__credit-stack"
                      onClick={openCredits}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="pre-hub__credit-stack__head">
                        <h3 className="pre-hub__credit-head">Crédits</h3>
                      </div>
                      <ul className="pre-hub__credit-lines">
                        {MOBILE_PREVIEW_CREDITS.map((p, index) => (
                          <li key={`mob-cred-${index}`} className="pre-hub__credit-line">
                            <span className="pre-hub__credit-name">{p.name}</span>
                            <span className="pre-hub__credit-role">{p.role}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pre-hub__credit-more-container">
                        <span className="pre-hub__credit-more">
                          Afficher plus
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ANCIEN EMPLACEMENT CRÉDITS SUPPRIMÉ */}
          </div>

          <section className="pre-hub__pane pre-hub__pane--chapters" aria-label="Chapitres disponibles">
            <div className="pre-hub__chapter-list">
              {displayedChapters.map((chapter) => {
                const isExpanded = expandedChapterId === chapter.id
                const [prefix, ...rest] = chapter.title.split('·')
                const mainTitle = rest.length > 0 ? rest.join('·').trim() : chapter.title

                return (
                  <article
                    key={chapter.id}
                    className={`pre-hub__chapter-card pre-hub__chapter-card--list ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => handleChapterClick(chapter.id)}
                    onKeyDown={(event) => handleCardKeyDown(event, chapter.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div 
                      className="pre-hub__chapter-thumb" 
                      style={{ backgroundImage: `url('${chapter.cover}')` }}
                      onClick={(e) => {
                        if (!isDesktop) {
                          e.stopPropagation()
                          goToLiseuse()
                        }
                      }}
                    >
                      {isDesktop && <span className="pre-hub__chapter-badge">{chapter.id}</span>}
                      {!isDesktop && (
                        <div className="pre-hub__chapter-thumb-overlay">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="pre-hub__chapter-content">
                      <div className="pre-hub__chapter-header-mobile">
                        <div className="pre-hub__chapter-texts">
                          <p className="pre-hub__chapter-title">
                            {isDesktop ? chapter.title : mainTitle}
                          </p>
                        </div>
                        
                        {!isDesktop && (
                          <span className="pre-hub__chapter-badge pre-hub__chapter-badge--mobile">
                            #{chapter.id}
                          </span>
                        )}
                      </div>
                      
                      <div className={`pre-hub__chapter-details ${isDesktop || isExpanded ? 'visible' : ''}`}>
                        <div className="pre-hub__chapter-info-row">
                          <span className="pre-hub__chapter-duration">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ~5 min
                          </span>
                        </div>
                        <p className="pre-hub__chapter-desc">{chapter.summary}</p>
                        
                        {!isDesktop && (
                          <button 
                            className="pre-hub__chapter-play-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              goToLiseuse()
                            }}
                          >
                            Lire
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {!isDesktop && visibleChapters < CHAPTERS.length && (
              <div className="pre-hub__more-container">
                <button className="pre-hub__more-btn" onClick={showMoreChapters}>
                  Afficher les chapitres suivants
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
      {showCredits && createPortal(
        <div className="credits-overlay" onClick={closeCredits}>
          <div
            className="credits-overlay__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Crédits Sound Tales"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="credits-overlay__head">
              <div>
                <p className="credits-overlay__eyebrow">PRODUCTION ORIGINALE</p>
                <h2 className="credits-overlay__title">Sound Tales · Crédits complets</h2>
              </div>
              <button type="button" className="credits-overlay__close" onClick={closeCredits}>
                Fermer
              </button>
            </div>
            <p className="credits-overlay__lede">
              Retrouvez l’intégralité des artistes et artisans derrière «&nbsp;Le prix de la haine&nbsp;».
            </p>
            <div className="credits-overlay__grid">
              {CREATIVE_CREDITS.map(({ id, title, people }) => (
                <div key={`overlay-${id}`} className="credits-overlay__card">
                  <h3 className="credits-overlay__card-title">{title}</h3>
                  <ul className="credits-overlay__card-lines">
                    {people.map(({ name, role }) => (
                      <li key={`overlay-${id}-${name}-${role}`} className="credits-overlay__card-line">
                        <span className="credits-overlay__card-name">{name}</span>
                        <span className="credits-overlay__card-role">{role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="credits-overlay__voices">
              <div className="credits-overlay__voices-head">
                <h3 className="credits-overlay__voices-title">{VOICE_SECTION_TITLE}</h3>
                <span className="credits-overlay__voices-count">{allVoices.length} talents</span>
              </div>
              <ul className="credits-overlay__voice-list">
                {allVoices.map(({ name, role }, index) => (
                  <li key={`overlay-voice-${name}-${role}-${index}`} className="credits-overlay__voice-line">
                    <span className="credits-overlay__voice-name">{name}</span>
                    <span className="credits-overlay__voice-role">{role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
