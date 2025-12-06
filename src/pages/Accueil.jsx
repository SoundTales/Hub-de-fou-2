import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { BookOpen, Headphones, Moon, Play, Info } from 'lucide-react'

const FEATURES = [
  {
    icon: <BookOpen size={32} />,
    title: 'Des histoires qui se dévorent',
    text: 'Les Tales sont centrés sur des dialogues et des personnages forts. Des histoires courtes et denses, sans temps mort. Vous aviez dit « juste un chapitre » ?'
  },
  {
    icon: <Headphones size={32} />,
    title: 'Vous êtes au cœur de la scène',
    text: 'Le thème musical, le sound design et les voix de comédiens soulignent les émotions. Les silences, la tension, pour que chaque scène prenne une dimension immersive.'
  },
  {
    icon: <Moon size={32} />,
    title: 'Votre nouveau rituel du soir',
    text: 'Casque sur les oreilles, lumière plus douce en mode nuit, le temps d’un ou deux chapitres. Notre liseuse est conçue pour améliorer le confort de votre lecture.'
  }
]

export default function Accueil() {
  const [expandCard1, setExpandCard1] = useState(false)
  const [expandCard2, setExpandCard2] = useState(false)

  return (
    <div className="page accueil-page page--fade">
      <section className="accueil__hero">
        <div className="accueil__hero-texts">
          <p className="accueil__eyebrow stagger-item delay-1">Original Audio Series</p>
          <h1 className="accueil__title stagger-item delay-2">
            <span style={{ color: '#ffff80' }}>Les Tales</span>
            <span>
              Les histoires, en plus <span style={{ color: '#ffff80' }}>intense.</span>
            </span>
          </h1>
          <p className="accueil__lede stagger-item delay-3">
            Un Tale, c’est une histoire pensée pour l’immersion : forte, centrée sur les personnages et les dialogues. La musique, le sound design, les illustrations et les dialogues interprétés par des comédiens accompagnent votre imaginaire et amplifient chaque émotion.
            <br /><br />
            La mise en scène vous place au cœur de l’histoire, sans jamais vous retirer le plaisir de la lecture.
          </p>
          <div className="accueil__cta-row stagger-item delay-4">
            <Link to="/hub" className="accueil__cta">
              Lire votre premier Tale
            </Link>
            <Link to="/creer-tale" className="accueil__cta accueil__cta--ghost">
              Créer un Tale
            </Link>
          </div>
          
          <div className="accueil__stats stagger-item delay-4">
            <div className="accueil__stat">
              <p className="accueil__stat-value">Reprenez votre Tale</p>
              <p className="accueil__stat-note">Sur tous vos appareils</p>
            </div>
            <div className="accueil__stat">
              <p className="accueil__stat-value">Mode jour & nuit</p>
              <p className="accueil__stat-note">Affichage personnalisé</p>
            </div>
            <div className="accueil__stat">
              <p className="accueil__stat-value">Composition & Sound Design</p>
              <p className="accueil__stat-note">synchronisés à votre lecture</p>
            </div>
          </div>
        </div>

        <div className="accueil__hero-visual stagger-item delay-3">
          <div className="accueil__hero-card">
            <h2 className="accueil__hero-card__title">
              Un studio d’histoires<br />
              Une plateforme de création
            </h2>
            <p className="accueil__hero-card__text">
              Sound Tales, c’est la rencontre d’un auteur et d’un compositeur qui ont choisi de fabriquer des histoires autrement. Notre premier Tale, « Le Prix de la haine », a été entièrement imaginé, créé, produit, édité et diffusé par nos soins, de la première lettre à la dernière note.
            </p>
            <p className="accueil__hero-card__text">
              Notre métier : accueillir des histoires et leur donner une forme immersive, aux côtés des artistes qui les écrivent, les jouent, les composent et les illustrent. Tale après Tale, ce sont de nouvelles voix, de nouveaux univers et de nouveaux talents qui prennent vie.
            </p>
            <p className="accueil__hero-card__text" style={{ marginBottom: 0, fontWeight: 700, color: '#ffff80' }}>
              En découvrant un Tale, vous ne faites pas que lire et écouter une histoire : vous participez à la création des prochaines.
            </p>
          </div>
        </div>
      </section>

      <section className="accueil__features-section">
        <div className="page-section-header">
          <p className="accueil__eyebrow">L'expérience Tale</p>
          <h2>Une nouvelle façon de vivre les histoires</h2>
        </div>
        <div className="accueil__features-grid">
          {FEATURES.map((feature, index) => (
            <article key={index} className="accueil__feature-card">
              <div className="accueil__feature-number">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-section">
        <div className="premium-grid">
          {/* Rubrique 1 */}
          <article className="premium-card">
            <header className="premium-card__header">
              <h2 className="premium-card__title">
                <span>Lire comme un roman</span>
                <span className="highlight">Le vivre comme un film</span>
              </h2>
            </header>

            <div className="premium-card__lists-container">
              <h3 className="premium-card__subtitle">Ce qui change par rapport à un livre classique :</h3>
              <ul className="premium-card__list">
                <li>un roman centré sur les personnages et les dialogues, pensé pour l’émotion</li>
                <li>des thèmes musicaux qui suivent les scènes, sans prendre le dessus sur le texte</li>
                <li>un sound design discret qui installe les lieux, les ambiances, la tension</li>
                <li>des voix de comédiens qui donnent du relief aux échanges.</li>
              </ul>
            </div>

            <button 
              className="premium-card__toggle-btn"
              onClick={() => setExpandCard1(!expandCard1)}
            >
              {expandCard1 ? 'Réduire' : 'Lire le contexte'}
            </button>

            <div className={`premium-card__content premium-card__hidden-content ${expandCard1 ? 'expanded' : ''}`}>
              <p>
                Vous aimez les histoires qui vous happent, celles qui laissent des scènes et des répliques en tête longtemps après coup. C’est là que les Tales prennent leur source.
              </p>
              <p>
                Un Tale, c’est un texte écrit comme un roman, avec des personnages travaillés, des dialogues importants et une vraie progression d’histoire. Mais chaque chapitre est accompagné de musique, de sound design et de voix de comédiens, pour que vous puissiez plonger facilement dans l’histoire et rester dedans sans effort.
              </p>
              <p>
                Que vous ayez l’habitude d'enchaîner les livres ou que vos soirées soient plutôt mangées par les écrans et la fatigue, un Tale est pensé pour trouver sa place dans votre quotidien : pour vous donner un repère, la durée d’un Tale est proche d’un ou deux films, le temps de vous installer, casque sur les oreilles, et de vous garder dans votre propre bulle d’imaginaire.
              </p>
              <p className="premium-card__footer">Vous lisez à votre rythme, partout.</p>
            </div>
          </article>

          {/* Rubrique 2 */}
          <article className="premium-card premium-card--alt">
            <header className="premium-card__header">
              <h2 className="premium-card__title">
                <span>Vous êtes en avance.</span>
                <span className="highlight">Tant mieux pour nous.</span>
              </h2>
            </header>

            <div className="premium-card__lists-container">
              <h3 className="premium-card__subtitle">Quand vous achetez un Tale aujourd’hui, vous ne faites pas qu’essayer quelque chose de différent :</h3>
              <ul className="premium-card__list">
                <li>vous rejoignez les premiers soutiens d’un format en lancement, ceux qui l’accompagnent dès ses débuts</li>
                <li>vous contribuez à rendre possibles les prochains Tales : écriture, composition, enregistrement des comédiens, direction artistique</li>
                <li>vous participez à faire exister une création portée par des artistes, plutôt qu’une ligne de plus dans une offre impersonnelle.</li>
              </ul>
            </div>

            <button 
              className="premium-card__toggle-btn"
              onClick={() => setExpandCard2(!expandCard2)}
            >
              {expandCard2 ? 'Réduire' : 'Lire le contexte'}
            </button>

            <div className={`premium-card__content premium-card__hidden-content ${expandCard2 ? 'expanded' : ''}`}>
              <p>
                Si vous tombez sur Sound Tales maintenant, c’est que vous avez sans doute un goût pour les projets encore confidentiels, ceux qu’on découvre avant qu’ils ne circulent partout.
              </p>
              <p>
                Sound Tales, c’est un nouveau médium de lecture porté par un auteur et un compositeur, avec un premier Tale produit en équipe réduite. Un format qui se construit en dehors des grandes plateformes, pas comme un catalogue de plus, mais comme un projet indépendant qui cherche ses premiers lecteurs.
              </p>

              <p className="premium-card__footer">
                Vous profitez d’un format encore rare,<br />
                et vous devenez une des personnes grâce à qui l’aventure peut continuer.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
