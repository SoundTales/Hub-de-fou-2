import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { Check, Info, AlertCircle } from 'lucide-react';

// Fonction de préchargement du composant TaleLanding
const preloadTaleLanding = () => import('./TaleLanding');

// Safe hook with fallback
const useToastSafe = () => {
  try {
    const { useToast } = require('../contexts/ToastContext');
    return useToast();
  } catch (e) {
    return { error: () => {}, success: () => {}, info: () => {} };
  }
};

export default function Hub() {
  const { error: toastError, success: toastSuccess } = useToastSafe();
  const [tales, setTales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState('idle') // idle, loading, success, error, already_subscribed
  const [prefAudio, setPrefAudio] = useState(true)
  const [prefVisual, setPrefVisual] = useState(false)

  useEffect(() => {
    // Préchargement du composant TaleLanding dès que le Hub est monté
    preloadTaleLanding();

    async function fetchTales() {
      try {
        setError(null)
        const { data, error } = await supabase
          .from('tales')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTales(data || []);
      } catch (error) {
        console.error('Error fetching tales:', error);
        const msg = "Impossible de charger les Tales pour le moment. Merci de réessayer ultérieurement."
        setError(msg)
      } finally {
        setLoading(false);
      }
    }

    fetchTales();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    
    setSubscribeStatus('loading')
    
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email,
          preference_audio: prefAudio,
          preference_visual: prefVisual
        }])
        
      if (error) {
        if (error.code === '23505') { // Unique violation code for Postgres
           setSubscribeStatus('already_subscribed')
        } else {
           throw error
        }
      } else {
        setSubscribeStatus('success')
        setEmail('')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      setSubscribeStatus('error')
    }
  }

  return (
    <div className="page pre-hub-page page--fade">
      <div className="page-section">
        <div className="page-section-header">
          <p className="accueil__eyebrow">Le Catalogue</p>
          <h2>Toutes nos histoires</h2>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.5)',
              color: '#fecaca',
              padding: '12px 16px',
              borderRadius: '10px',
              margin: '12px 0 18px'
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ minHeight: '400px', opacity: 0 }}></div>
        ) : (
          <div className="tales-grid">
            {tales.map((tale) => {
              const coverSource = tale.cover_image || tale.cover_url;
              const finalCoverUrl = coverSource && !coverSource.startsWith('http') 
                ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${coverSource.split('/').map(part => encodeURIComponent(part)).join('/')}` 
                : coverSource;

              return (
                <Link 
                  to={`/tale/${tale.slug}`} 
                  state={{ tale }} // On passe les données déjà chargées
                  key={tale.id} 
                  className="tale-card-link"
                  onMouseEnter={() => {
                    // Préchargement des données du Tale au survol
                    supabase
                      .from('tales')
                      .select('*')
                      .eq('slug', tale.slug)
                      .single()
                      .then(() => console.log('Tale data preloaded'));
                  }}
                >
                  <div className="tale-card">
                    <div className="tale-card__image">
                      <img 
                        src={finalCoverUrl} 
                        alt={tale.title} 
                        loading="eager"
                        onError={(e) => {e.target.src = 'https://placehold.co/600x900/1a1a1a/ffffff?text=No+Cover'}}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
            {tales.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <p>Aucune histoire publiée pour le moment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && (
        <section className="contact-section" aria-label="Rester connecté·e aux prochains Tales" style={{ marginTop: '60px' }}>
          <article className="contact-card">
            <div className="contact-header">
              <p className="accueil__eyebrow">Lecteurs & auditeurs</p>
              <h3>Être prévenu du prochain Tale</h3>
              <p>
                Laissez votre adresse et nous vous avertirons quand le prochain Tale sera prêt dans la Liseuse, avec éventuellement un accès
                en avant-première et quelques coulisses.
              </p>
            </div>
            <form className="modern-form" onSubmit={handleSubscribe}>
              <div className="form-group">
                <label className="form-label">Adresse e-mail</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="email" 
                      className="form-input" 
                      name="newsletter-email" 
                      required 
                      placeholder="vous@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                    />
                </div>
              </div>
              
              {subscribeStatus === 'success' && (
                  <div style={{ color: '#4ade80', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={18} /> Inscription confirmée ! Merci.
                  </div>
              )}
              {subscribeStatus === 'already_subscribed' && (
                  <div style={{ color: '#fbbf24', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={18} /> Vous êtes déjà inscrit.
                  </div>
              )}
              {subscribeStatus === 'error' && (
                  <div style={{ color: '#f87171', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={18} /> Une erreur est survenue. Réessayez plus tard.
                  </div>
              )}

                          <fieldset className="checkbox-group" style={{ marginTop: "1rem" }}>
                <legend>Preferences de contenus</legend>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="newsletter-audio"
                    name="newsletter-audio"
                    checked={prefAudio}
                    onChange={(e) => setPrefAudio(e.target.checked)}
                  />
                  <label htmlFor="newsletter-audio">Ecoutes audio & lectures</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="newsletter-visuel"
                    name="newsletter-visuel"
                    checked={prefVisual}
                    onChange={(e) => setPrefVisual(e.target.checked)}
                  />
                  <label htmlFor="newsletter-visuel">Illustrations & making-of</label>
                </div>
              </fieldset>
              <button 
                  type="submit" 
                  className="form-submit form-submit--ghost"
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
              >
                {subscribeStatus === 'loading' ? 'Inscription...' : 'Me prévenir pour le prochain Tale'}
              </button>
            </form>
          </article>
        </section>
      )}

      <style>{`
        .pre-hub-page {
          padding-top: 100px;
        }

        .tales-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: 40px; 
          justify-items: center;
          animation: fadeInSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .tale-card-link { text-decoration: none; color: inherit; display: block; width: 100%; max-width: 340px; }
        .tale-card { display: flex; flex-direction: column; gap: 16px; align-items: center; transition: transform 0.3s ease; }
        .tale-card:hover { transform: translateY(-8px); }
        
        .tale-card__image { 
          width: 100%; 
          aspect-ratio: 0.625; /* Ratio 1:1.6 comme sur la page de présentation */
          border-radius: 24px; 
          overflow: hidden; 
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .tale-card:hover .tale-card__image {
          border-color: #ffff80;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .tale-card__image img { width: 100%; height: 100%; object-fit: cover; }

        @media (max-width: 768px) {
          .pre-hub-page {
            padding-top: 80px;
          }
          .page-section {
            padding-top: 24px !important;
            padding-bottom: 24px !important;
          }
          .tales-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .tale-card-link {
            max-width: none;
          }
          .tale-card__image {
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}
