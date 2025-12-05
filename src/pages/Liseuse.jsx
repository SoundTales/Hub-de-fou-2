import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { ArrowLeft } from 'lucide-react'
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
  const [chapterData, setChapterData] = useState(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

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
    setHasStarted(true)
  }

  const playVoice = (charName, path) => {
    console.log(`🗣️ VOIX [${charName}]: ${path}`)
    // Ici: new Audio(path).play()
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
        <Link to={`/tale/${taleId}`} className="absolute-back-btn"><ArrowLeft /> Retour</Link>
        <div className="cover-container">
          <img 
            src={chapterData.meta.coverImage || "https://placehold.co/400x600/1a1a1a/white?text=No+Cover"} 
            alt="Cover" 
            className="cover-image"
          />
        </div>
        <h1 className="chapter-title">{chapterData.meta.title}</h1>
        <button className="start-btn" onClick={handleStartChapter}>
          COMMENCER LA LECTURE
        </button>
        <style>{`
          .start-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background-color: #0a0a0a; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
          .cover-container { width: 100%; max-width: 300px; aspect-ratio: 2/3; margin-bottom: 2rem; box-shadow: 0 0 30px rgba(0,0,0,0.8); overflow: hidden; border-radius: 8px; }
          .cover-image { width: 100%; height: 100%; object-fit: cover; }
          .chapter-title { color: white; text-align: center; margin-bottom: 2rem; font-size: 1.5rem; }
          .start-btn { background: #00d2ff; color: #000; border: none; padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; border-radius: 50px; cursor: pointer; text-transform: uppercase; transition: transform 0.2s; }
          .start-btn:hover { transform: scale(1.05); background: #fff; }
          .absolute-back-btn { position: absolute; top: 20px; left: 20px; color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; opacity: 0.7; transition: opacity 0.2s; }
          .absolute-back-btn:hover { opacity: 1; }
        `}</style>
      </div>
    )
  }

  // Contenu du chapitre
  return (
    <div className="liseuse-container">
      <Link to={`/tale/${taleId}`} className="liseuse-back-nav"><ArrowLeft size={20} /> Quitter</Link>
      
      <div className="liseuse-content">
        {chapterData.blocks.map((block, index) => {
          switch (block.type) {
            
            case 'text':
              return <p key={index} className="block-text">{block.content}</p>

            case 'dialogue':
              // Gestion optimisée avec charId et couleurs
              const charInfo = getCharacter(block.charId || block.character) // Fallback si ancien JSON
              const voicePath = getAudioPath('voice', block.voiceFile || block.audioSrc)
              
              return (
                <div 
                  key={index} 
                  className="block-dialogue"
                  style={{ borderLeftColor: charInfo.color }}
                  onClick={() => playVoice(charInfo.name, voicePath)}
                >
                  <span className="char-name" style={{ color: charInfo.color }}>
                    {charInfo.name}
                  </span>
                  <p>« {block.content} »</p>
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
        .liseuse-container { max-width: 800px; margin: 0 auto; padding: 40px 20px 150px 20px; color: #eee; min-height: 100vh; background-color: #111; position: relative; }
        .liseuse-back-nav { position: fixed; top: 20px; left: 20px; color: rgba(255,255,255,0.5); text-decoration: none; display: flex; align-items: center; gap: 8px; z-index: 50; transition: color 0.2s; }
        .liseuse-back-nav:hover { color: white; }
        .block-text { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; color: #ccc; font-family: 'Georgia', serif; }
        
        .block-dialogue {
          background: rgba(255,255,255,0.05);
          border-left: 4px solid #fff; /* Sera écrasé par le style inline */
          padding: 1rem; margin: 2rem 0; cursor: pointer; border-radius: 0 8px 8px 0;
          transition: background 0.2s;
        }
        .block-dialogue:hover { background: rgba(255,255,255,0.1); }
        .char-name { font-weight: bold; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 5px;}
        
        .debug-trigger { font-size: 0.6rem; color: #333; text-align: center; padding: 2px; opacity: 0.2; }
        .liseuse-error { color: #ff6b6b; text-align: center; margin-top: 50px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .liseuse-loading { text-align: center; margin-top: 50px; color: #888; }
        .back-link { color: white; text-decoration: underline; }
      `}</style>
    </div>
  )
}
