import { useEffect, useState, useRef } from 'react'
import ReaderSplash from './ReaderSplash.jsx'
import PageViewport from './PageViewport.jsx'
import MusicRail from './MusicRail.jsx'
import { createAudioEngine } from './AudioEngine.js'

// Guard contre double splash dans un mÃªme montage (StrictMode)
let splashProcessed = false

export default function ReaderShell({ chapterId, baseUrl }) {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [splashData, setSplashData] = useState(null)
  const [preloadDone, setPreloadDone] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const containerRef = useRef(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [musicVolume, setMusicVolume] = useState(0.8)
  const [readDialogIds, setReadDialogIds] = useState(new Set())
  const [navDir, setNavDir] = useState('next')
  const engineRef = useRef(null)

  // Mode lecteur pour scoper styles/gestes
  useEffect(() => {
    try { document.body.dataset.mode = 'reader' } catch {}
    return () => { try { document.body.dataset.mode = 'hub' } catch {} }
  }, [])

  // Splash payload (une seule fois)
  useEffect(() => {
    if (splashProcessed) return
    try {
      const seen = localStorage.getItem('reader:splashSeen') === '1'
      if (seen) { try { sessionStorage.removeItem('reader:splash') } catch {}; splashProcessed = true; return }
      const raw = sessionStorage.getItem('reader:splash')
      if (raw) {
        const data = JSON.parse(raw)
        setSplashData(data)
        setShowSplash(true)
        sessionStorage.removeItem('reader:splash')
        splashProcessed = true
      }
    } catch {}
  }, [])

  // PrÃ©chargement minimal (remplacÃ© plus tard par vrai fetch + decode)
  useEffect(() => {
    let alive = true
    const doPreload = async () => {
      try { await new Promise(r => setTimeout(r, 800)) } finally { if (alive) setPreloadDone(true) }
    }
    doPreload()
    return () => { alive = false }
  }, [chapterId])

  // Init AudioEngine
  useEffect(() => { engineRef.current = createAudioEngine() }, [])
  useEffect(() => { engineRef.current?.setMusicVolume(musicVolume) }, [musicVolume])

  // Doubleâ€‘tap overlay (et dÃ©marre lâ€™audio si besoin)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let lastTap = 0
    const onClick = () => { const now = Date.now(); if (now - lastTap < 300) { setOverlayOpen(v => !v); engineRef.current?.ensureStarted() } lastTap = now }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [])

  // Contenu mock (2 pages)
  const pages = [
    { index: 0, blocks: [
      { type: 'para', id: 'p1', text: "C'Ã©tait toujours pareil..." },
      { type: 'dialogue', id: 'd1', speaker: 'Malone', text: "On s'occupe de tout. On va faire le reste." },
      { type: 'para', id: 'p2', text: 'Elle secoua sa tÃªte de haut en bas...' }
    ]},
    { index: 1, blocks: [
      { type: 'para', id: 'p3', text: "Le monde autour resta lÃ  jusqu'Ã  l'aube..." },
      { type: 'dialogue', id: 'd2', speaker: 'Zadig', text: 'Malone, regarde.' }
    ]}
  ]

  const handleDialogueTap = (id) => {
    setReadDialogIds(prev => new Set(prev).add(id))
    engineRef.current?.ensureStarted() // dÃ©marre le contexte si ce nâ€™est pas dÃ©jÃ  le cas
    // Lecture voix Ã  brancher ultÃ©rieurement
  }

  return (
    <div className="reader" ref={containerRef}>
      {showSplash && splashData && (
        <ReaderSplash
          id={splashData.id || String(chapterId)}
          title={splashData.title || `Chapitre ${chapterId}`}
          img={splashData.img}
          ready={preloadDone}
          onFinished={() => { try { localStorage.setItem('reader:splashSeen','1') } catch {}; setShowSplash(false) }}
        />
      )}
      {!showSplash && (
        <>
          <header className="reader__header">
            <button className="reader__back" onClick={() => { window.location.hash = '#/' }}>â† Retour</button>
            <div className="reader__title">Chapitre {chapterId}</div>
          </header>
          <main className="reader__stage">
            <PageViewport
              key={pageIndex}
              page={pages[pageIndex]}
              dir={navDir}
              readDialogIds={readDialogIds}
              onDialogueTap={handleDialogueTap}
              onSwipeNext={() => { setNavDir('next'); setPageIndex(i => Math.min(i + 1, pages.length - 1)) }}
              onSwipePrev={() => { setNavDir('prev'); setPageIndex(i => Math.max(i - 1, 0)) }}
              onDoubleTap={() => { setOverlayOpen(v => !v); engineRef.current?.ensureStarted() }}
            />
            <MusicRail value={musicVolume} onChange={setMusicVolume} />
          </main>
          {overlayOpen && (
            <div className="reader__overlay">Overlay (marqueâ€‘page, accueil, chapitrage)</div>
          )}
        </>
      )}
    </div>
  )
}



