import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { ArrowLeft, Maximize2, Minimize2, Play, Settings } from 'lucide-react'
import { useAuth } from '../supabase/AuthContext.jsx'

// --- Composant ScrollTriggerBlock (Inchangé) ---
const ScrollTriggerBlock = ({ onVisible, children }) => {
  const elementRef = useRef(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !hasTriggered) { onVisible(); setHasTriggered(true) }
      }, { threshold: 0.5 })
    if (elementRef.current) observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [hasTriggered, onVisible])
  return <div ref={elementRef}>{children}</div>
}

export default function Liseuse() {
  const { taleId, chapterId } = useParams() // taleId = slug, chapterId = UUID
  const navigate = useNavigate()
  const [chapterData, setChapterData] = useState(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [introExiting, setIntroExiting] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playingBlockIndex, setPlayingBlockIndex] = useState(null) // Track active dialogue
  const [showHint, setShowHint] = useState(false) // Ghost hint visibility
  const [isFullscreen, setIsFullscreen] = useState(false)
  const currentAudioRef = useRef(null)
  const hasClickedRef = useRef(false) // Track if user has ever clicked
  const { user } = useAuth()

  // Gestionnaire de changement d'état plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      // Note: On ne force plus la sortie du plein écran ici pour éviter les conflits 
      // avec le StrictMode de React qui démonte/remonte le composant au chargement,
      // ce qui causait la perte du plein écran dès l'arrivée sur la page.
    }
  }, [])

  const handleQuit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Erreur sortie plein écran:", err))
    }
    navigate(-1)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    async function fetchChapter() {
      try {
        // 1. Récupérer les infos du chapitre depuis Supabase
        const { data: chapter, error: dbError } = await supabase
            .from('chapters')
            .select('*')
            .eq('id', chapterId)
            .single()
        
        if (dbError || !chapter) {
            console.error("DB Error:", dbError)
            throw new Error("Chapitre introuvable ou accès refusé.")
        }

        if (chapter.is_premium && !user) {
          throw new Error("Connexion ou achat requis pour ce chapitre premium.")
        }

        // 2. Récupérer le contenu JSON
        // Cas A : Le contenu est stocké directement dans la colonne 'content' (JSONB)
        let content = chapter.content 
        
        // Cas B : Le contenu est stocké via une URL externe (ex: Wix, S3) dans 'content_url'
        if (!content && chapter.content_url) {
            const res = await fetch(chapter.content_url)
            if (!res.ok) throw new Error("Erreur lors du téléchargement du contenu.")
            content = await res.json()
        } 
        
        if (!content) {
             throw new Error("Contenu du chapitre vide ou manquant.")
        }

        // Fusionner les données de la table avec le contenu JSON pour avoir accès à cover_image
        setChapterData({ ...content, cover_image: chapter.cover_image })

      } catch (err) {
        console.error(err)
        setError(err.message || "Une erreur est survenue.")
      } finally {
        setLoading(false)
      }
    }
    
    if (chapterId) fetchChapter()
  }, [chapterId])

  // --- Helpers pour la structure Optimisée ---

  // Récupère les infos du personnage (Nom, Couleur) depuis les métadonnées
  const getCharacter = (charId) => {
    if (!chapterData?.meta?.characters) return { name: charId, color: '#fff' }
    return chapterData.meta.characters[charId] || { name: charId, color: '#fff' }
  }

  // Construit le chemin complet pour l'audio (Music, SFX, Voice)
  const getAudioPath = (type, filenameOrId) => {
    if (!chapterData?.meta?.basePaths) return filenameOrId // Fallback

    const base = chapterData.meta.basePaths
    
    if (type === 'voice') {
      return base.voices + filenameOrId
    }
    
    // Pour Music et SFX, on doit d'abord trouver le nom de fichier dans le registre
    if (type === 'music') {
      const filename = chapterData.audioRegistry?.tracks?.[filenameOrId] || filenameOrId
      return base.music + filename
    }
    
    if (type === 'sfx') {
      const filename = chapterData.audioRegistry?.sfx?.[filenameOrId] || filenameOrId
      return base.sfx + filename
    }

    return filenameOrId
  }

  // --- Actions ---

  const handleStartChapter = () => {
    console.log("Audio context unlocked")
    // On s'assure d'être en plein écran au lancement
    if (!document.fullscreenElement) {
      toggleFullscreen()
    }
    
    // Déclenche l'animation de sortie
    setIntroExiting(true)
    
    // Attend la fin de l'animation pour démonter l'intro
    setTimeout(() => {
      setHasStarted(true)
      setIntroExiting(false)
    }, 800)
  }

  // Gestion du Ghost Hint
  useEffect(() => {
    if (!hasStarted) return
    
    const timer = setTimeout(() => {
      if (!hasClickedRef.current) {
        setShowHint(true)
      }
    }, 3000) // Apparaît après 3s si aucune interaction

    return () => clearTimeout(timer)
  }, [hasStarted])

  const playVoice = (index, charName, path) => {
    console.log(`🗣️ VOIX [${charName}]: ${path}`)
    
    // 1. Gestion du Hint
    if (!hasClickedRef.current) {
      hasClickedRef.current = true
      setShowHint(false)
    }

    // 2. Stop audio précédent
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
    }

    // 3. Play nouveau
    const audio = new Audio(path)
    currentAudioRef.current = audio
    setPlayingBlockIndex(index)

    audio.play().catch(e => console.error("Erreur lecture audio:", e))
    
    audio.onended = () => {
      setPlayingBlockIndex(null)
    }
  }

  const triggerSfx = (sfxId) => {
    const path = getAudioPath('sfx', sfxId)
    console.log(`💥 SFX: ${path}`)
    // Ici: new Audio(path).play()
  }

  const triggerMusic = (action, trackId) => {
    const path = getAudioPath('music', trackId)
    console.log(`🎵 MUSIC [${action}]: ${path}`)
    // Ici: Gestion du player musique (fade in/out)
  }

  const saveCheckpoint = (id) => {
    console.log(`💾 Checkpoint: ${id}`)
  }

  // --- Rendu ---

  if (loading) return <div className="liseuse-loading">Chargement du récit...</div>
  
  if (error) return (
    <div className="liseuse-error">
        <p>{error}</p>
        <Link to={`/tale/${taleId}`} className="back-link">Retour au Tale</Link>
    </div>
  )

  if (!chapterData) return null

  // Préparation des données pour l'intro
  let coverImage = chapterData.cover_image || chapterData.meta?.coverImage;
  if (coverImage && !coverImage.startsWith('http') && !coverImage.startsWith('blob')) {
      const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL; 
      const cleanPath = coverImage.split('/').map(part => encodeURIComponent(part)).join('/');
      coverImage = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${cleanPath}`;
  }
  if (!coverImage) {
      coverImage = "https://placehold.co/400x600/1f2023/FFF?text=No+Image";
  }

  // Préparation des données pour la liseuse
  const firstDialogueIndex = chapterData.blocks.findIndex(b => b.type === 'dialogue')

  // États d'affichage
  const showIntro = !hasStarted || introExiting
  const showReader = hasStarted || introExiting

  return (
    <>
      {/* --- ÉCRAN D'INTRO --- */}
      {showIntro && (
        <div className={`start-screen ${introExiting ? 'exiting' : ''}`}>
          <div className="start-screen-header">
            <button onClick={handleQuit} className="icon-btn"><ArrowLeft size={24} /></button>
            <button onClick={toggleFullscreen} className="icon-btn">
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </div>
          
          <h1 className="chapter-title stagger-item delay-1">{chapterData.meta.title}</h1>

          <div className="cover-container stagger-item delay-2">
            <img 
              src={coverImage} 
              alt="Cover" 
              className="cover-image"
              onError={(e) => {
                   e.target.onerror = null; 
                   e.target.src = "https://placehold.co/400x600/1f2023/FFF?text=No+Image";
              }}
            />
          </div>
          
          <button className="start-btn stagger-item delay-3" onClick={handleStartChapter}>
            <Play size={20} fill="currentColor" style={{ marginRight: '10px' }} />
            COMMENCER LA LECTURE
          </button>

          <style>{`
            .start-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background-color: #fefff4; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; padding: 20px; padding-bottom: 8vh; transition: opacity 0.8s ease-in-out; }
            .start-screen.exiting { opacity: 0; pointer-events: none; }
            
            .start-screen-header { position: absolute; top: 0; left: 0; width: 100%; padding: 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
            .icon-btn { background: transparent; border: none; color: #1f2023; cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
            .icon-btn:hover { background: rgba(0,0,0,0.05); color: black; }
            
            .cover-container { width: 100%; max-width: 380px; aspect-ratio: 2/3; margin-bottom: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden; border-radius: 12px; transform: translateY(20px); opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            .cover-image { width: 100%; height: 100%; object-fit: cover; }
            
            .chapter-title { color: #1f2023; text-align: center; margin-bottom: 2rem; font-size: 3.5rem; line-height: 1.1; font-family: 'Playfair Display', serif; font-weight: 700; letter-spacing: -0.02em; transform: translateY(20px); opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            
            .start-btn { background: #1f2023; color: #fefff4; border: none; padding: 1.4rem 3rem; font-size: 1.1rem; font-weight: 600; border-radius: 50px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; align-items: center; transform: translateY(20px); opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
            .start-btn:hover { transform: scale(1.05) translateY(0); box-shadow: 0 15px 30px rgba(0,0,0,0.15); background: #000; }

            .stagger-item.delay-1 { animation-delay: 0.1s; }
            .stagger-item.delay-2 { animation-delay: 0.3s; }
            .stagger-item.delay-3 { animation-delay: 0.5s; }

            @keyframes fadeInUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @media (max-width: 768px) {
              .start-screen { padding-bottom: 10vh; }
              .cover-container { max-width: 280px; margin-bottom: 2rem; }
              .start-btn { padding: 1.2rem 2.5rem; font-size: 1rem; }
              .chapter-title { font-size: 2.2rem; margin-bottom: 1.5rem; }
            }
          `}</style>
        </div>
      )}

      {/* --- LISEUSE --- */}
      {showReader && (
        <div className="liseuse-container page page--zoom">
          <header className="liseuse-header">
            <button onClick={handleQuit} className="liseuse-nav-btn"><ArrowLeft size={20} /> Quitter</button>
            <div className="liseuse-controls">
              <button onClick={toggleFullscreen} className="liseuse-icon-btn">
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button className="liseuse-icon-btn"><Settings size={20} /></button>
            </div>
          </header>
          
          <div className="liseuse-content">
            {chapterData.blocks.map((block, index) => {
              switch (block.type) {
                
                case 'text':
                  return <p key={index} className="block-text">{block.content}</p>

                case 'dialogue':
                  const voicePath = getAudioPath('voice', block.voiceFile || block.audioSrc)
                  const isPlaying = playingBlockIndex === index
                  const isFirstDialogue = index === firstDialogueIndex
                  const showGhostHint = isFirstDialogue && showHint
                  const activeColor = '#feca57' // Gold standard
                  
                  return (
                    <div 
                      key={index} 
                      className={`block-dialogue ${isPlaying ? 'dialogue--active' : ''} ${showGhostHint ? 'dialogue--hint' : ''}`}
                      style={{ 
                        borderLeftColor: isPlaying ? activeColor : '#1f2023',
                        backgroundColor: isPlaying ? `rgba(0,0,0,0.05)` : undefined,
                        boxShadow: isPlaying ? `inset 4px 0 0 0 ${activeColor}, 0 4px 20px rgba(0,0,0,0.1)` : undefined,
                        transform: isPlaying ? 'translateX(4px)' : undefined
                      }}
                      onClick={() => playVoice(index, 'Dialogue', voicePath)}
                    >
                      <div className="dialogue-content">
                        {block.turns ? (
                          block.turns.map((turn, i) => (
                            <p key={i} style={{ marginBottom: i === block.turns.length - 1 ? 0 : '0.8rem', margin: 0 }}>
                              {turn.content}
                            </p>
                          ))
                        ) : Array.isArray(block.content) ? (
                          block.content.map((line, i) => (
                            <p key={i} style={{ marginBottom: i === block.content.length - 1 ? 0 : '0.8rem', margin: 0 }}>
                              {line}
                            </p>
                          ))
                        ) : (
                          <p style={{ margin: 0 }}>{block.content}</p>
                        )}
                      </div>
                    </div>
                  )

                case 'sfx_cue':
                  return (
                    <ScrollTriggerBlock key={index} onVisible={() => triggerSfx(block.sfxId)}>
                      <div className="debug-trigger">⚡</div>
                    </ScrollTriggerBlock>
                  )

                case 'music_cue':
                  return (
                    <ScrollTriggerBlock key={index} onVisible={() => triggerMusic(block.action, block.trackId)}>
                      <div className="debug-trigger">🎵</div>
                    </ScrollTriggerBlock>
                  )

                case 'checkpoint':
                  saveCheckpoint(block.id)
                  return null

                default:
                  return null
              }
            })}
          </div>

          <style>{`
            .liseuse-container { max-width: 800px; margin: 0 auto; padding: 80px 20px 150px 20px; color: #1f2023; min-height: 100vh; background-color: #fefff4; position: relative; }
            
            .liseuse-header {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              padding: 15px 25px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              z-index: 100;
              background: linear-gradient(to bottom, rgba(254,255,244,0.95) 0%, rgba(254,255,244,0) 100%);
              pointer-events: none;
            }
            .liseuse-header > * { pointer-events: auto; }
            
            .liseuse-nav-btn {
              background: rgba(0,0,0,0.05);
              border: none;
              color: #1f2023;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 0.9rem;
              padding: 8px 16px;
              border-radius: 30px;
              transition: all 0.2s;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(0,0,0,0.05);
            }
            .liseuse-nav-btn:hover { background: rgba(0,0,0,0.1); color: #000; }
            
            .liseuse-controls { display: flex; gap: 10px; }
            
            .liseuse-icon-btn {
              background: rgba(0,0,0,0.05);
              border: none;
              color: #1f2023;
              cursor: pointer;
              padding: 10px;
              border-radius: 50%;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(0,0,0,0.05);
            }
            .liseuse-icon-btn:hover { background: rgba(0,0,0,0.1); color: #000; }

            .block-text { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; color: #333; font-family: 'Georgia', serif; }
            
            .block-dialogue {
              background: rgba(0,0,0,0.03);
              border-left: 4px solid #1f2023;
              padding: 1.5rem; margin: 2rem 0; cursor: pointer; border-radius: 0 8px 8px 0;
              transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
              position: relative;
              height: auto;
            }
            .block-dialogue p {
              font-family: 'Georgia', serif;
              font-size: 1.1rem;
              line-height: 1.6;
              color: #1f2023;
              margin: 0;
            }
            .block-dialogue:hover { background: rgba(0,0,0,0.06); transform: translateX(2px); }
            
            .dialogue--hint {
              animation: hint-shake 3s infinite ease-in-out;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
            }

            @keyframes hint-shake {
              0%, 100% { transform: translateX(0); }
              5% { transform: translateX(6px); }
              10% { transform: translateX(0); }
              15% { transform: translateX(6px); }
              20% { transform: translateX(0); }
            }

            .char-name { font-weight: bold; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 5px;}
            
            .debug-trigger { font-size: 0.6rem; color: #333; text-align: center; padding: 2px; opacity: 0.2; }
            .liseuse-error { color: #ff6b6b; text-align: center; margin-top: 50px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
            .liseuse-loading { text-align: center; margin-top: 50px; color: #888; }
            .back-link { color: #1f2023; text-decoration: underline; }
          `}</style>
        </div>
      )}
    </>
  )
}
