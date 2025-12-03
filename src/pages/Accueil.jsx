import { Link } from 'react-router-dom'

const HERO_STATS = [
	{
		label: 'Histoire',
		value: "d’auteurs",
		note: 'Des romans courts écrits pour le format Tale.'
	},
	{
		label: 'Composition',
		value: 'musicale',
		note: 'Des thèmes originaux pensés pour accompagner la lecture.'
	},
	{
		label: 'Dialogues',
		value: 'joués',
		note: 'Des comédiens voix interprètent les scènes, pas un simple livre audio.'
	},
	{
		label: 'Illustrations',
		value: 'de chapitres',
		note: 'Des visuels pour marquer les moments clés de l’histoire.'
	},
	{
		label: 'Sound design',
		value: "d’ambiance",
		note: 'Des bruitages qui installent le lieu, l’époque et la tension.'
	}
]

const FEATURES = [
	{
		title: 'Format Série',
		text: 'Des chapitres courts de 10 à 15 minutes, calibrés pour s’insérer dans votre quotidien comme un épisode de série TV. Une lecture rythmée qui ne vous demande pas des heures de disponibilité.'
	},
	{
		title: 'Immersion Totale',
		text: 'Chaque scène est portée par une composition originale, des bruitages d’ambiance et des voix jouées par des comédiens. Vous ne lisez plus seulement, vous êtes au cœur de l’action.'
	},
	{
		title: 'Lecture Hybride',
		text: 'Commencez votre lecture dans le métro, basculez en audio pour la marche, reprenez le texte le soir. Le Tale s’adapte à votre moment sans jamais perdre le fil de l’histoire.'
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
					<p className="accueil__eyebrow stagger-item delay-1">Original Audio Series</p>
					<h1 className="accueil__title stagger-item delay-2">
						<span>Écoutez</span>
						<span style={{ color: '#ffff80' }}>L'Invisible</span>
					</h1>
					<p className="accueil__lede stagger-item delay-3">
						Plongez dans une nouvelle dimension narrative. Sound Tales combine écriture immersive, design sonore spatial
						et performances vocales pour créer des films pour vos oreilles.
					</p>
					<div className="accueil__cta-row stagger-item delay-4">
						<Link to="/hub" className="accueil__cta">
							Découvrir le catalogue
						</Link>
						<Link to="/creer-tale" className="accueil__cta accueil__cta--ghost">
							Créer un Tale
						</Link>
					</div>
					
					<div className="accueil__stats stagger-item delay-4">
						<div className="accueil__stat">
							<div className="accueil__stat-label">Immersion</div>
							<p className="accueil__stat-value">3D Audio</p>
							<p className="accueil__stat-note">Binaural natif</p>
						</div>
						<div className="accueil__stat">
							<div className="accueil__stat-label">Catalogue</div>
							<p className="accueil__stat-value">12+ Séries</p>
							<p className="accueil__stat-note">Mises à jour hebdo</p>
						</div>
					</div>
				</div>

				<div className="accueil__hero-visual stagger-item delay-3">
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

			<section className="accueil__features-section">
				<div className="page-section-header">
					<p className="accueil__eyebrow">L'expérience Tale</p>
					<h2>Une nouvelle façon de vivre les histoires</h2>
				</div>
				<div className="accueil__features-grid">
					{FEATURES.map((feature, index) => (
						<article key={index} className="accueil__feature-card">
							<div className="accueil__feature-number">0{index + 1}</div>
							<h3>{feature.title}</h3>
							<p>{feature.text}</p>
						</article>
					))}
				</div>
			</section>

			<section className="contact-section" aria-label="Rester connecté·e aux prochains Tales">
				<article className="contact-card">
					<div className="contact-header">
						<p className="accueil__eyebrow">Lecteurs & auditeurs</p>
						<h3>Être prévenu du prochain Tale</h3>
						<p>
							Laissez votre adresse et nous vous avertirons quand le prochain Tale sera prêt dans la Liseuse, avec éventuellement un accès
							en avant-première et quelques coulisses.
						</p>
					</div>
					<form className="modern-form" onSubmit={handlePlaceholderSubmit}>
						<div className="form-group">
							<label className="form-label">Adresse e-mail</label>
							<input type="email" className="form-input" name="newsletter-email" required placeholder="vous@email.com" />
						</div>
						<fieldset className="checkbox-group">
							<legend>Préférences de contenus</legend>
							<div className="checkbox-item">
								<input type="checkbox" id="newsletter-audio" name="newsletter-audio" defaultChecked />
								<label htmlFor="newsletter-audio">Écoutes audio & lectures</label>
							</div>
							<div className="checkbox-item">
								<input type="checkbox" id="newsletter-visuel" name="newsletter-visuel" />
								<label htmlFor="newsletter-visuel">Illustrations & making-of</label>
							</div>
						</fieldset>
						<button type="submit" className="form-submit form-submit--ghost">
							Me prévenir pour le prochain Tale
						</button>
					</form>
				</article>
			</section>
		</div>
	)
}

