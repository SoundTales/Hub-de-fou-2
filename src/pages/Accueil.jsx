import { Link } from 'react-router-dom'

const HERO_STATS = [
  { label: 'Formats', value: 'One-shot · Saga · Serie', note: 'Pensés pour 2 à 6 h de lecture continue.' },
  { label: 'Dialogues joués', value: '2+ par chapitre', note: 'Des voix interprétées comme au théâtre.' },
  { label: 'Langue', value: '100 % français', note: 'Une scène dédiée aux auteurs francophones.' }
]

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
      'Auteurs, compositeurs, sound designers, illustrateurs et comédiens collaborent au sein du studio pour transformer un manuscrit en Tale complet.'
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
    bullets: ['Structure proche des séries TV', 'Dialogues centraux et narratifs', 'Peut changer d’équipe par saison']
  }
]

const GUIDELINES = [
  'Immersion dès la première scène : accroche forte, personnage mémorable, décor sonore clair.',
  'Univers identifiable et thématique lisible, même sur un format court.',
  'Style fluide, accessible et prêt à être lu à voix haute puis joué en studio.',
  'Chaque Tale doit pouvoir être adapté (podcast, série, vidéo) sans être réécrit en profondeur.'
]

const STRATEGY_CARDS = [
  {
    title: 'Fidéliser les lecteurs',
    content:
      'Dialogues dynamiques, univers immersifs et épisodes réguliers créent une habitude de visite tout en donnant envie de recommander la Liseuse.'
  },
  {
    title: 'Attirer les talents',
    content:
      'Transparence sur les revenus, créditation complète, accompagnement artistique et possibilité de co-diriger la production attirent auteurs et studios.'
  },
  {
    title: 'Préparer le transmedia',
    content:
      'Les Tales sont pensés pour être adaptés facilement en audio, vidéo ou formats hybrides grâce à leur structure dialoguée et leur mise en son.'
  }
]

const handlePlaceholderSubmit = (event) => {
  event.preventDefault()
}

export default function Accueil() {
  return (
    <div className="page accueil-page">
      <section className="accueil__hero">
        <div className="accueil__hero-texts">
          <h1 className="accueil__title">
            <span>Les Tales,</span>
            <span>les histoires en mieux</span>
          </h1>
          <p className="accueil__lede">
            Les Tales sont des romans courts augmentés par de la musique, du sound design, des voix jouées et des illustrations. Vous lisez,
            vous écoutez et vous voyez l’histoire se déployer comme une série. Ce premier Tale pose les bases d’une future plateforme dédiée
            aux auteurs francophones.
          </p>
          <div className="accueil__cta-row">
            <Link className="accueil__cta" to="/hub">
              Découvrir notre première histoire
            </Link>
            <Link className="accueil__cta accueil__cta--ghost" to="/liseuse">
              Créer votre Tale
            </Link>
          </div>
          <dl className="accueil__stats">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="accueil__stat">
                <dt className="accueil__stat-label">{stat.label}</dt>
                <dd className="accueil__stat-value">{stat.value}</dd>
                <dd className="accueil__stat-note">{stat.note}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="accueil__hero-visual">
          <div className="accueil__hero-card">
            <h2 className="accueil__hero-card__title">Studio & plateforme</h2>
            <p className="accueil__hero-card__text">
              Nous produisons les premiers Tales en interne pour financer la technologie de Liseuse, attirer les lecteurs et ouvrir la porte
              aux prochains auteurs. Chaque projet associe manuscrit, direction artistique et post-production audio.
            </p>
            <ul className="accueil__hero-card__list">
              <li>Du manuscrit au Tale prêt à être lu et écouté.</li>
              <li>Une équipe artistique sur mesure pour chaque projet.</li>
              <li>Une Liseuse pensée pour la lecture immersive.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="accueil__manifesto" aria-label="Ligne éditoriale">
        <div className="accueil__manifesto-copy">
          <h2>Pourquoi ce format</h2>
          <p>
            Les Tales reprennent la durée d’un film multipliée par deux : 2 à 4 heures pour un One-shot, 4 à 6 heures pour une Série Tale.
            Ce temps de lecture court rassure les lecteurs qui n’ont pas l’habitude d’ouvrir un roman mais veulent une expérience intense.
          </p>
          <p>
            La force du Tale réside dans ses dialogues : ils sont joués par de vrais comédiens, soutenus par une mise en son complète. Nous
            capitalisons sur ce point pour convaincre les producteurs et faciliter toute adaptation.
          </p>
          <p>
            Chaque lancement de Tale nourrit la techno de la Liseuse et le catalogue. Plus il y a d’œuvres, plus nous attirons auteurs,
            studios et lecteurs, jusqu’à proposer une liseuse physique et des abonnements transparents.
          </p>
        </div>
      </section>

      <section className="accueil__formats" aria-label="Formats Tales">
        {TALE_FORMATS.map((format) => (
          <article key={format.title} className="accueil__format-card">
            <div className="accueil__format-head">
              <h3>{format.title}</h3>
              <p className="accueil__format-duration">{format.duration}</p>
            </div>
            <p className="accueil__format-summary">{format.summary}</p>
            <ul>
              {format.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="accueil__playbook" aria-label="Expérience et vision">
        <div className="accueil__playbook-column">
          <p className="accueil__eyebrow">Expérience Tale</p>
          <h2>Ce qui rend la lecture différente</h2>
          {VALUE_PILLARS.map((pillar) => (
            <article key={pillar.title} className="accueil__playbook-card">
              <h3>{pillar.title}</h3>
              <p>{pillar.content}</p>
            </article>
          ))}
        </div>
        <div className="accueil__playbook-column">
          <p className="accueil__eyebrow">Vision Sound Tales</p>
          <h2>Ce que votre soutien débloque</h2>
          {STRATEGY_CARDS.map((card) => (
            <article key={card.title} className="accueil__playbook-card">
              <h3>{card.title}</h3>
              <p>{card.content}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="accueil__engagement" aria-label="Participer à l’aventure Sound Tales">
        <article className="accueil__form-card">
          <header>
            <p className="accueil__eyebrow">Auteurs & artistes</p>
            <h3>Proposer un manuscrit ou rejoindre une production</h3>
            <p>
              Vous avez un roman court, un scénario de série ou un profil artistique (composition, sound design, illustration, voix) ?
              Parlons-en et voyons comment le transformer en Tale.
            </p>
          </header>
          <form className="accueil__form" onSubmit={handlePlaceholderSubmit}>
            <label>
              Nom / collectif
              <input type="text" name="artist-name" required placeholder="Votre nom ou celui de votre collectif" />
            </label>
            <label>
              Rôle principal
              <input type="text" name="discipline" required placeholder="Auteur, scénariste, compositeur, sound designer..." />
            </label>
            <label>
              Message
              <textarea
                name="artist-message"
                rows="4"
                placeholder="Parlez-nous de votre projet, de votre univers ou de votre disponibilité."
              />
            </label>
            <button type="submit" className="accueil__form-btn">
              Envoyer ma proposition de Tale
            </button>
          </form>
        </article>

        <article className="accueil__form-card accueil__form-card--secondary">
          <header>
            <p className="accueil__eyebrow">Lecteurs & auditeurs</p>
            <h3>Être prévenu du prochain Tale</h3>
            <p>
              Laissez votre adresse et nous vous avertirons quand le prochain Tale sera prêt dans la Liseuse, avec éventuellement un accès
              en avant-première et quelques coulisses.
            </p>
          </header>
          <form className="accueil__form" onSubmit={handlePlaceholderSubmit}>
            <label>
              Adresse e-mail
              <input type="email" name="newsletter-email" required placeholder="vous@email.com" />
            </label>
            <fieldset className="accueil__checkbox-group">
              <legend>Préférences de contenus</legend>
              <div className="accueil__checkbox">
                <input type="checkbox" id="newsletter-audio" name="newsletter-audio" defaultChecked />
                <label htmlFor="newsletter-audio">Écoutes audio & lectures</label>
              </div>
              <div className="accueil__checkbox">
                <input type="checkbox" id="newsletter-visuel" name="newsletter-visuel" />
                <label htmlFor="newsletter-visuel">Illustrations & making-of</label>
              </div>
            </fieldset>
            <button type="submit" className="accueil__form-btn accueil__form-btn--ghost">
              Me prévenir pour le prochain Tale
            </button>
          </form>
        </article>
      </section>
    </div>
  )
}
