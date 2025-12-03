import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="app-footer__content">
        <div className="app-footer__brand">
          <img src="/logo.svg" alt="Sound Tales" className="app-footer__logo" />
          <p className="app-footer__tagline">
            Lisez, écoutez, vivez l'histoire.
            <br />
            Le studio de lecture immersive.
          </p>
        </div>

        <nav className="app-footer__nav" aria-label="Navigation pied de page">
          <div className="app-footer__col">
            <h4>Explorer</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/hub">Le Hub (Catalogue)</Link></li>
              <li><Link to="/liseuse">Démo Liseuse</Link></li>
            </ul>
          </div>
          <div className="app-footer__col">
            <h4>Créateurs</h4>
            <ul>
              <li><Link to="/creer-tale">Proposer un Tale</Link></li>
              <li><Link to="/creer-tale">Rejoindre le studio</Link></li>
            </ul>
          </div>
          <div className="app-footer__col">
            <h4>Légal</h4>
            <ul>
              <li><a href="#">Mentions légales</a></li>
              <li><a href="#">Confidentialité</a></li>
              <li><a href="#">CGU</a></li>
            </ul>
          </div>
        </nav>
      </div>
      
      <div className="app-footer__bottom">
        <p>&copy; {currentYear} Sound Tales. Tous droits réservés.</p>
      </div>
    </footer>
  )
}
