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
      // Quitter le plein écran automatiquement à la sortie
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Erreur sortie plein écran:", err))
      }
    }
  }, [])

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

        setChapterData(content)

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
    // toggleFullscreen() // Déjà géré en amont
    setHasStarted(true)
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

  // Écran de démarrage
  if (!hasStarted) {
    return (
      <div className="start-screen">
        <div className="start-screen-header">
          <button onClick={() => navigate(-1)} className="icon-btn"><ArrowLeft size={24} /></button>
          <button onClick={toggleFullscreen} className="icon-btn">
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
        </div>
        
        <div className="cover-container">
          <img 
            src={chapterData.meta.coverImage || "https://placehold.co/400x600/1a1a1a/white?text=No+Cover"} 
            alt="Cover" 
            className="cover-image"
          />
        </div>
        <h1 className="chapter-title">{chapterData.meta.title}</h1>
        <button className="start-btn" onClick={handleStartChapter}>
          <Play size={20} fill="currentColor" style={{ marginRight: '10px' }} />
          COMMENCER LA LECTURE
        </button>
        <style>{`
          .start-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background-color: #0a0a0a; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
          .start-screen-header { position: absolute; top: 0; left: 0; width: 100%; padding: 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
          .icon-btn { background: transparent; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
          .icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }
          
          .cover-container { width: 100%; max-width: 300px; aspect-ratio: 2/3; margin-bottom: 2rem; box-shadow: 0 0 30px rgba(0,0,0,0.8); overflow: hidden; border-radius: 8px; }
          .cover-image { width: 100%; height: 100%; object-fit: cover; }
          .chapter-title { color: white; text-align: center; margin-bottom: 2rem; font-size: 1.5rem; font-family: 'Playfair Display', serif; }
          .start-btn { background: #feca57; color: #1f2023; border: none; padding: 1rem 2rem; font-size: 1.1rem; font-weight: bold; border-radius: 50px; cursor: pointer; text-transform: uppercase; transition: transform 0.2s; display: flex; align-items: center; }
          .start-btn:hover { transform: scale(1.05); background: #fff; }
        `}</style>
      </div>
    )
  }

  // Contenu du chapitre
  const firstDialogueIndex = chapterData.blocks.findIndex(b => b.type === 'dialogue')

  return (
    <div className="liseuse-container page page--zoom">
      <header className="liseuse-header">
        <button onClick={() => navigate(-1)} className="liseuse-nav-btn"><ArrowLeft size={20} /> Quitter</button>
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
                    borderLeftColor: isPlaying ? activeColor : '#fff',
                    backgroundColor: isPlaying ? `rgba(255,255,255,0.08)` : undefined,
                    boxShadow: isPlaying ? `inset 4px 0 0 0 ${activeColor}, 0 4px 20px rgba(0,0,0,0.2)` : undefined,
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
        .liseuse-container { max-width: 800px; margin: 0 auto; padding: 80px 20px 150px 20px; color: #eee; min-height: 100vh; background-color: #111; position: relative; }
        
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
          background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
          pointer-events: none;
        }
        .liseuse-header > * { pointer-events: auto; }
        
        .liseuse-nav-btn {
          background: rgba(0,0,0,0.3);
          border: none;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          padding: 8px 16px;
          border-radius: 30px;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .liseuse-nav-btn:hover { background: rgba(255,255,255,0.2); color: white; }
        
        .liseuse-controls { display: flex; gap: 10px; }
        
        .liseuse-icon-btn {
          background: rgba(0,0,0,0.3);
          border: none;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          padding: 10px;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .liseuse-icon-btn:hover { background: rgba(255,255,255,0.2); color: white; }

        .block-text { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; color: #ccc; font-family: 'Georgia', serif; }
        
        .block-dialogue {
          background: rgba(255,255,255,0.05);
          border-left: 4px solid #fff;
          padding: 1.5rem; margin: 2rem 0; cursor: pointer; border-radius: 0 8px 8px 0;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          height: auto;
        }
        .block-dialogue p {
          font-family: 'Georgia', serif;
          font-size: 1.1rem;
          line-height: 1.6;
          color: #eee;
          margin: 0;
        }
        .block-dialogue:hover { background: rgba(255,255,255,0.1); transform: translateX(2px); }
        
        .dialogue--hint {
          animation: hint-shake 3s infinite ease-in-out;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
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
        .back-link { color: white; text-decoration: underline; }
      `}</style>
    </div>
  )
}
