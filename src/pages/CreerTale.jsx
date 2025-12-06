import { useState } from 'react'
import { Link } from 'react-router-dom'

const VALUE_PILLARS = [
  {
    title: 'Immersion sonore',
    content:
      'Musique originale, sound design et voix jouées accompagnent chaque scène pour donner l’impression de lire un épisode de série.'
  },
  {
    title: 'Narration pensée série',
    content:
      'Chapitres rythmés, dialogues omniprésents et accroches fortes dès l’ouverture pour créer un rendez-vous régulier avec le lecteur.'
  },
  {
    title: 'Studio accompagnant',
    content:
      'Auteurs, compositeurs, sound designers, illustrateurs et comédiens collaborent avec Sound Tales pour transformer un manuscrit en Tale complet.'
  }
]

const TALE_FORMATS = [
  {
    title: 'Tale One-shot',
    duration: 'Roman court · 2 à 4 h',
    summary:
      'Une histoire complète en un seul volume. Intrigue focalisée, peu de personnages, résolution immédiate et dialogues joués à chaque chapitre.',
    bullets: ['Idéal pour explorer un univers', 'Conflit unique, narration resserrée', 'Expérience immersive sans engagement long']
  },
  {
    title: 'Série Tale',
    duration: 'Saison courte · 4 à 6 h',
    summary:
      'Chaque Tale devient une saison composée de chapitres-épisodes publiés à cadence régulière pour créer une habitude de lecture.',
    bullets: ['Structure proche des séries TV', 'Dialogues centraux et narratifs', 'Peut changer d’équipe créative par saison']
  }
]

const STRATEGY_CARDS = [
  {
    title: 'Un format rassurant',
    content:
      'Les Tales sont calibrés pour des durées courtes. Ils permettent à vos lecteurs de terminer une histoire sans s’engager sur 600 pages.'
  },
  {
    title: 'Une vitrine dédiée',
    content:
      'La Liseuse met en avant votre texte, vos voix, votre musique et vos visuels. Le site devient une carte de visite pour démarcher éditeurs et producteurs.'
  },
  {
    title: 'Une logique transmedia',
    content:
      'Dialogues joués, structure épisodique, sound design : tout est pensé pour faciliter adaptations en série audio, vidéo ou formats hybrides.'
  }
]

const PROCESS_STEPS = [
  {
    title: 'Le Manuscrit',
    desc: 'Tout part d’un texte. Roman court, nouvelle ou scénario, il constitue la colonne vertébrale du projet.'
  },
  {
    title: 'L’Adaptation',
    desc: 'Découpage en chapitres, réécriture des dialogues pour l’audio et notes d’intentions sonores.'
  },
  {
    title: 'La Production',
    desc: 'Casting des voix, composition de la musique originale et création du sound design en studio.'
  },
  {
    title: 'La Publication',
    desc: 'Intégration dans la Liseuse, création de la couverture et mise en ligne sur la plateforme.'
  }
]

const EDITORIAL_PILLARS = [
  { icon: '⚡', text: 'Des histoires courtes mais denses.' },
  { icon: '🎭', text: 'Des dialogues au centre de la mise en scène.' },
  { icon: '🔊', text: 'Des univers forts, pensés pour le son.' }
]

const handlePlaceholderSubmit = (event) => {
  event.preventDefault()
}

export default function CreerTale() {
  const [mode, setMode] = useState('story')

  const selectStory = () => setMode('story')
  const selectCollab = () => setMode('collab')

  return (
    <div className="page accueil-page page--fade">
      <section className="accueil__hero">
        <div className="accueil__hero-texts">
          <p className="accueil__eyebrow stagger-item delay-1">Studio de création</p>
          <h1 className="accueil__title stagger-item delay-2">
            <span style={{ color: '#ffff80' }}>Créer votre Tale,</span>
            <span>mettre votre histoire en <span style={{ color: '#ffff80' }}>scène</span></span>
          </h1>
          <p className="accueil__lede stagger-item delay-3">
            Vous avez un roman court, un scénario de série ou un univers fort ? Un Tale vous permet de lui ajouter musique, sound design,
            voix jouées et illustrations, tout en gardant une lecture fluide dans la Liseuse.
          </p>
          <div className="accueil__cta-row stagger-item delay-4">
            <Link className="accueil__cta" to="/hub">
              Voir un Tale en action
            </Link>
            <Link className="accueil__cta accueil__cta--ghost" to="/">
              Retour à la présentation
            </Link>
          </div>
        </div>

        <div className="accueil__hero-visual stagger-item delay-3">
          <div className="accueil__hero-card">
            <h2 className="accueil__hero-card__title">Ce que nous apportons</h2>
            <p className="accueil__hero-card__text">
              Sound Tales est un studio qui accompagne la production complète de votre Tale et lui offre une place privilégiée dans la
              Liseuse. Vous pouvez co-diriger le projet ou nous laisser porter la production jusqu’au veto final.
            </p>
            <ul className="accueil__hero-card__list">
              <li>Accompagnement éditorial et découpages adaptés au format.</li>
              <li>Connexion avec compositeurs, comédiens et illustrateurs.</li>
              <li>Publication et mise en avant dans notre catalogue.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="creer-editorial" aria-label="Ligne éditoriale">
        <div className="page-section-header">
          <p className="accueil__eyebrow">L'ADN d'un Tale</p>
          <h2>Une ligne éditoriale forte</h2>
        </div>
        
        <div className="editorial-grid">
          {EDITORIAL_PILLARS.map((pillar, index) => (
            <article key={index} className="editorial-card">
              <span className="editorial-card__icon" aria-hidden="true">{pillar.icon}</span>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="creer-flow" aria-label="Comment un projet devient un Tale">
        <div className="page-section-header">
          <p className="accueil__eyebrow">La méthode</p>
          <h2>Du manuscrit au Tale publié</h2>
        </div>
        <div className="process-steps">
          {PROCESS_STEPS.map((step) => (
            <div key={step.title} className="process-step">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="creer-formats" aria-label="Choisir un format de Tale">
        <div className="page-section-header" style={{ gridColumn: '1 / -1' }}>
          <p className="accueil__eyebrow">Le catalogue</p>
          <h2>Nos formats de production</h2>
        </div>
        <div className="formats-grid">
          {TALE_FORMATS.map((format) => (
            <article key={format.title} className="creer-format-card">
              <header className="creer-format-card__head">
                <h3>{format.title}</h3>
                <p className="creer-format-card__duration">{format.duration}</p>
              </header>
              <p style={{ opacity: 0.85, lineHeight: 1.6 }}>{format.summary}</p>
              <div className="creer-format-card__tags" style={{ marginTop: 'auto', paddingTop: '16px' }}>
                {format.bullets.map((item) => (
                  <span key={item} className="creer-format-card__tag">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="value-grid" aria-label="Expérience et vision pour les artistes">
        <div className="value-column">
          <header className="value-column-header">
            <span>Expérience Tale</span>
            <h3>Ce que ressent le lecteur</h3>
          </header>
          {VALUE_PILLARS.map((pillar) => (
            <article key={pillar.title} className="value-card">
              <h4>{pillar.title}</h4>
              <p>{pillar.content}</p>
            </article>
          ))}
        </div>
        <div className="value-column">
          <header className="value-column-header">
            <span>Pourquoi le produire ici</span>
            <h3>Ce que la plateforme offre</h3>
          </header>
          {STRATEGY_CARDS.map((card) => (
            <article key={card.title} className="value-card">
              <h4>{card.title}</h4>
              <p>{card.content}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" aria-label="Formulaire de contact">
        <div className="contact-card">
          <div className="contact-header">
            <h3>Rejoignez l'aventure</h3>
            <p>Que vous ayez une histoire à raconter ou un talent à partager, Sound Tales est votre nouvelle scène.</p>
          </div>

          <div className="form-toggle">
            <button
              type="button"
              className={`form-toggle-btn ${mode === 'story' ? 'active' : ''}`}
              onClick={selectStory}
            >
              J'ai une histoire
            </button>
            <button
              type="button"
              className={`form-toggle-btn ${mode === 'collab' ? 'active' : ''}`}
              onClick={selectCollab}
            >
              Je suis un artiste
            </button>
          </div>

          <form className="modern-form" onSubmit={handlePlaceholderSubmit}>
            {mode === 'story' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Nom ou Collectif</label>
                  <input type="text" className="form-input" placeholder="Comment doit-on vous appeler ?" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email de contact</label>
                  <input type="email" className="form-input" placeholder="pour@vous.repondre" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Format envisagé</label>
                  <select className="form-select" defaultValue="">
                    <option value="" disabled>Sélectionnez un format</option>
                    <option value="one-shot">Tale One-shot (2-4h)</option>
                    <option value="serie">Série Tale (Saison)</option>
                    <option value="unknown">Je ne sais pas encore</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Pitch de l'histoire</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Le concept, les enjeux, l'ambiance... Dites-nous tout."
                    rows="5"
                  ></textarea>
                </div>
                <button type="submit" className="form-submit">
                  Envoyer mon projet
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Nom d'artiste</label>
                  <input type="text" className="form-input" placeholder="Votre nom de scène" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="pour@vous.repondre" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Votre discipline</label>
                  <select className="form-select" defaultValue="">
                    <option value="" disabled>Votre spécialité principale</option>
                    <option value="music">Composition Musicale</option>
                    <option value="sfx">Sound Design</option>
                    <option value="voice">Comédien·ne Voix</option>
                    <option value="art">Illustration</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Portfolio / Démo</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Lien vers vos travaux (SoundCloud, ArtStation...)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Présentez-vous et dites-nous ce qui vous plaît dans le format Tale."
                    rows="4"
                  ></textarea>
                </div>
                <button type="submit" className="form-submit">
                  Proposer ma collaboration
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}
