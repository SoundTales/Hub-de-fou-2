import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';

export default function Hub() {
  const [tales, setTales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTales() {
      try {
        const { data, error } = await supabase
          .from('tales')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTales(data || []);
      } catch (error) {
        console.error('Error fetching tales:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTales();
  }, []);

  return (
    <div className="page pre-hub-page" style={{ paddingTop: '100px' }}>
      <div className="page-section">
        <div className="page-section-header">
          <p className="accueil__eyebrow">Le Catalogue</p>
          <h2>Toutes nos histoires</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>Chargement du catalogue...</div>
        ) : (
          <div className="tales-grid">
            {tales.map((tale) => (
              <Link to={`/tale/${tale.slug}`} key={tale.id} className="tale-card-link">
                <div className="tale-card">
                  <div className="tale-card__image">
                    <img 
                      src={tale.cover_url} 
                      alt={tale.title} 
                      onError={(e) => {e.target.src = 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Cover'}}
                    />
                  </div>
                  <div className="tale-card__content">
                    <h3>{tale.title}</h3>
                    <p>{tale.synopsis ? tale.synopsis.substring(0, 100) + '...' : 'Une histoire Sound Tales.'}</p>
                    <span className="tale-card__cta">Découvrir &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
            {tales.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <p>Aucune histoire publiée pour le moment.</p>
              </div>
            )}
          </div>
        )}
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
