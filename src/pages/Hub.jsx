import { Link } from 'react-router-dom';
import { talesRegistry } from '../data/talesRegistry';

export default function Hub() {
  return (
    <div className="page pre-hub-page" style={{ paddingTop: '100px' }}>
      <div className="page-section">
        <div className="page-section-header">
          <p className="accueil__eyebrow">Le Catalogue</p>
          <h2>Toutes nos histoires</h2>
        </div>

        <div className="tales-grid">
          {talesRegistry.map((tale) => (
            <Link to={`/tale/${tale.id}`} key={tale.id} className="tale-card-link">
              <div className="tale-card">
                <div className="tale-card__image">
                  <img src={tale.cover} alt={tale.title} />
                </div>
                <div className="tale-card__content">
                  <h3>{tale.title}</h3>
                  <p>{tale.description.substring(0, 100)}...</p>
                  <span className="tale-card__cta">Découvrir &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .tales-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
        .tale-card-link { text-decoration: none; color: inherit; display: block; }
        .tale-card { background: rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; transition: transform 0.3s; border: 1px solid rgba(255,255,255,0.1); }
        .tale-card:hover { transform: translateY(-5px); border-color: #ffff80; }
        .tale-card__image { height: 200px; overflow: hidden; }
        .tale-card__image img { width: 100%; height: 100%; object-fit: cover; }
        .tale-card__content { padding: 20px; }
        .tale-card__content h3 { margin: 0 0 10px; color: #fefff4; font-size: 1.2rem; }
        .tale-card__content p { font-size: 0.9rem; opacity: 0.7; margin-bottom: 20px; line-height: 1.5; }
        .tale-card__cta { color: #ffff80; font-weight: bold; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
      `}</style>
    </div>
  );
}
