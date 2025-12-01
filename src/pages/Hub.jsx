import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CHAPTERS = [
  { id: '1', title: 'Chapitre 1 · Le réveil', summary: 'Résumé à venir.', cover: 'https://picsum.photos/seed/osrase1/800/450' },
  { id: '2', title: 'Chapitre 2 · Les machines', summary: 'Résumé à venir.', cover: 'https://picsum.photos/seed/osrase2/800/450' },
  { id: '3', title: 'Chapitre 3 · Les frères', summary: 'Résumé à venir.', cover: 'https://picsum.photos/seed/osrase3/800/450' },
  { id: '4', title: 'Chapitre 4 · La faille', summary: 'Résumé à venir.', cover: 'https://picsum.photos/seed/osrase4/800/450' },
  { id: '5', title: 'Chapitre 5 · Les cendres', summary: 'Résumé à venir.', cover: 'https://picsum.photos/seed/osrase5/800/450' },
  { id: '6', title: 'Chapitre 6 · L’ascension', summary: 'Résumé à venir.', cover: 'https://picsum.photos/seed/osrase6/800/450' }
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

const ALL_VOICES = [...BASE_VOICES, ...EXTRA_VOICES]
const VOICE_SECTION_TITLE = 'Comédiens voix'

export default function Hub() {
  const [showCredits, setShowCredits] = useState(false)
  const navigate = useNavigate()

  const voices = BASE_VOICES
  const allVoices = ALL_VOICES

  const goToLiseuse = () => navigate('/liseuse')
  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goToLiseuse()
    }
  }
  const openCredits = () => setShowCredits(true)
  const closeCredits = () => setShowCredits(false)

  useEffect(() => {
    if (!showCredits) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowCredits(false)
      }
    }

    const previousOverflow = typeof document !== 'undefined' ? document.body.style.overflow : ''
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (typeof document !== 'undefined') {
        document.body.style.overflow = previousOverflow
      }
    }
  }, [showCredits])

  return (
    <div className="page pre-hub-page">
      <div className="pre-hub">
        <div className="pre-hub__inner">
          <section className="pre-hub__hero">
            <div className="pre-hub__hero-grid">
              <div className="pre-hub__media">
                <div className="pre-hub__poster">
                  <img
                    src="https://static.wixstatic.com/media/b9ad46_9fcfea21c381472e97a9a9bc10386509~mv2.jpg"
                    alt="Illustration de l'univers Osrase"
                    width="640"
                    height="800"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="pre-hub__hero-text">
                <p className="pre-hub__novel-title">Le prix de la haine</p>
                <p className="pre-hub__lead">
                  Deux frères en quête de vengeance sont propulsés dans la machinerie du pouvoir&nbsp;: l’un par le
                  système, l’autre par la révolte. Rendez-vous au sommet.
                </p>
                <button type="button" className="pre-hub__cta" onClick={goToLiseuse}>
                  Commencer la lecture
                </button>
                <div className="pre-hub__credits-grid">
                  {CREATIVE_CREDITS.map(({ id, title, people }) => (
                    <div key={id} className="pre-hub__credit-stack">
                      <div className="pre-hub__credit-stack__head">
                        <h3 className="pre-hub__credit-head">{title}</h3>
                      </div>
                      <ul className="pre-hub__credit-lines">
                        {people.map(({ name, role }) => (
                          <li key={`${id}-${name}-${role}`} className="pre-hub__credit-line">
                            <span className="pre-hub__credit-name">{name}</span>
                            <span className="pre-hub__credit-role">{role}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="pre-hub__credit-stack pre-hub__credit-stack--voices">
                    <div className="pre-hub__credit-stack__head">
                      <h3 className="pre-hub__credit-head">{VOICE_SECTION_TITLE}</h3>
                    </div>
                    <ul className="pre-hub__credit-lines">
                      {voices.map(({ name, role }, index) => (
                        <li key={`voices-hero-${name}-${role}-${index}`} className="pre-hub__credit-line">
                          <span className="pre-hub__credit-name">{name}</span>
                          <span className="pre-hub__credit-role">{role}</span>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="pre-hub__credit-more" onClick={openCredits}>
                      Afficher plus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pre-hub__pane pre-hub__pane--chapters" aria-label="Chapitres disponibles">
            <div className="pre-hub__chapter-grid">
              {CHAPTERS.map((chapter) => (
                <article
                  key={chapter.id}
                  className="pre-hub__chapter-card"
                  tabIndex={0}
                  role="button"
                  onClick={goToLiseuse}
                  onKeyDown={handleCardKeyDown}
                >
                  <div className="pre-hub__chapter-thumb" style={{ backgroundImage: `url('${chapter.cover}')` }}>
                    <span className="pre-hub__chapter-badge">{chapter.id}</span>
                  </div>
                  <div className="pre-hub__chapter-texts">
                    <p className="pre-hub__chapter-title">{chapter.title}</p>
                    <span className="pre-hub__chapter-meta">~5 min • OSRASE</span>
                  </div>
                  <p className="pre-hub__chapter-desc">{chapter.summary}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      {showCredits && (
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
        </div>
      )}
    </div>
  )
}
