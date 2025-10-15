import { useEffect, useState, useRef } from 'react'
import ReaderSplash from './ReaderSplash.jsx'
import PageViewport from './PageViewport.jsx'
import MusicRail from './MusicRail.jsx'
import VoiceRail from './VoiceRail.jsx'
import { createAudioEngine } from './AudioEngine.js'
import { useChapter } from './useChapter.js'
import { getEntitlements, createCheckoutSession } from '../api/client.js'

// Guard to avoid double splash in React StrictMode
let lastSplashGuard = { id: null, ts: 0 }

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
  const [entitled, setEntitled] = useState(true)
  const [paywall, setPaywall] = useState(null)
  const firedRef = useRef(new Set())
  const [audioReady, setAudioReady] = useState(false)
  const [fontScale, setFontScale] = useState(1)
  const [textBtn, setTextBtn] = useState('none') // none | small | large
  const [theme, setTheme] = useState('light')
  const [bookmarked, setBookmarked] = useState(false)
  const [overlayTab, setOverlayTab] = useState('none') // none | chapters | bookmark
  const [voiceVolume, setVoiceVolume] = useState(1)
  const overlayTapRef = useRef(0)

  // Scope body mode
  useEffect(() => {
    try { document.body.dataset.mode = 'reader' } catch {}
    return () => { try { document.body.dataset.mode = 'hub' } catch {} }
  }, [])

  // Splash: once per session and per chapter
  useEffect(() => {
    try {
      const chapterKey = `reader:splashSeen:${chapterId}`
      const already = sessionStorage.getItem(chapterKey) === '1'
      const raw = sessionStorage.getItem('reader:splash')
      if (raw && !already) {
        const data = JSON.parse(raw)
        const now = Date.now()
        const dup = lastSplashGuard.id === String(chapterId) && (now - lastSplashGuard.ts) < 3000
        if (!dup) {
          lastSplashGuard = { id: String(chapterId), ts: now }
          setSplashData(data)
          setShowSplash(true)
        }
      }
      try { sessionStorage.removeItem('reader:splash') } catch {}
    } catch {}
  }, [chapterId])

  // Minimal preload (mock)
  useEffect(() => {
    let alive = true
    const doPreload = async () => {
      try { await new Promise(r => setTimeout(r, 800)) } finally { if (alive) setPreloadDone(true) }
    }
    doPreload()
    return () => { alive = false }
  }, [chapterId])

  // Audio engine
  useEffect(() => { engineRef.current = createAudioEngine() }, [])
  useEffect(() => { engineRef.current?.setMusicVolume(musicVolume) }, [musicVolume])
  useEffect(() => { engineRef.current?.setVoiceVolume?.(voiceVolume) }, [voiceVolume])

  // Apply font scale and theme on container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.style.setProperty('--reader-font-scale', String(fontScale))
    el.dataset.theme = theme
  }, [fontScale, theme])

  // Reset modules when overlay opens
  useEffect(() => {
    if (overlayOpen) setOverlayTab('none')
  }, [overlayOpen])

  // Ensure audio context starts on first user gesture inside the reader
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onFirstPointer = async () => {
      try { await engineRef.current?.ensureStarted() } catch {}
      setAudioReady(true)
      el.removeEventListener('pointerdown', onFirstPointer, true)
      el.removeEventListener('touchstart', onFirstPointer, true)
      el.removeEventListener('mousedown', onFirstPointer, true)
    }
    el.addEventListener('pointerdown', onFirstPointer, true)
    el.addEventListener('touchstart', onFirstPointer, true)
    el.addEventListener('mousedown', onFirstPointer, true)
    return () => {
      el.removeEventListener('pointerdown', onFirstPointer, true)
      el.removeEventListener('touchstart', onFirstPointer, true)
      el.removeEventListener('mousedown', onFirstPointer, true)
    }
  }, [])

  // Double-tap handled in PageViewport only (ignored on dialogues)

  // Load chapter via API/Mocks and compute pages
  const { loading, error, ast, pages } = useChapter({ taleId: 'tale1', chapterId, baseUrl })

  // Autoplay best-effort: dès que l'AST est chargé, tenter de lancer la première boucle
  useEffect(() => {
    if (!ast?.triggers) return
    const engine = engineRef.current
    if (!engine) return
    const cues = ast.triggers.filter(t => t.kind === 'cue' && t.src)
    if (!cues.length) return
    let chosen = cues[0]
    let best = 1
    for (const t of cues) {
      const at = String(t.at || '')
      if (/^progress:/i.test(at)) {
        const p = parseFloat(at.split(':')[1] || '0')
        if (!isNaN(p) && p < best) { best = p; chosen = t }
      }
    }
    engine.ensureStarted()?.finally(() => engine.setCue(chosen.src, { fadeMs: 220, loop: chosen.loop !== false }))
  }, [ast])

  // Check entitlements (stub + mocks)
  useEffect(() => {
    let alive = true
    async function check() {
      try {
        const e = await getEntitlements()
        const ok = !!(e?.chapters?.[`tale1:${chapterId}`] || e?.tales?.tale1)
        if (alive) setEntitled(ok)
      } catch {
        if (alive) setEntitled(true) // dev default
      }
    }
    check()
    return () => { alive = false }
  }, [chapterId])

  const handleDialogueTap = async (id) => {
    console.log('=== DIALOGUE TAP HANDLER ===')
    console.log('Dialogue ID cliqué:', id)
    console.log('AST actuel:', ast)
    console.log('Triggers disponibles:', ast?.triggers)
    console.log('Engine ref:', engineRef.current)
    
    setReadDialogIds(prev => new Set(prev).add(id))
    
    // S'assurer que le contexte audio est démarré
    try {
      if (!engineRef.current) {
        console.error('Engine audio non initialisé!')
        return
      }
      
      await engineRef.current.ensureStarted()
      console.log('Contexte audio démarré, état:', engineRef.current.state)
    } catch (err) {
      console.error('Erreur démarrage audio:', err)
      return
    }
    
    // Trouver le bloc de dialogue pour obtenir les infos de voix
    const dialogue = ast?.blocks?.find(b => b.id === id)
    if (!dialogue) {
      console.warn('Dialogue non trouvé dans AST:', id)
      return
    }
    
    console.log('Dialogue trouvé:', dialogue)
    
    // Chercher le trigger de voix correspondant
    let voiceTrigger = ast?.triggers?.find(t => 
      t.kind === 'voice' && (
        t.at === `dialogue:${id}` || 
        t.id === dialogue.voice ||
        t.at === dialogue.voice
      )
    )
    
    console.log('Trigger de voix trouvé:', voiceTrigger)
    
    // Si aucun trigger trouvé, essayer de construire le chemin audio à partir de la propriété voice
    if (!voiceTrigger && dialogue.voice) {
      const audioPath = `${baseUrl}audio/voices/${dialogue.voice}.mp3`
      console.log('Construction du chemin audio:', audioPath)
      try {
        await engineRef.current.playVoice(audioPath)
        console.log('Audio joué depuis chemin construit')
      } catch (err) {
        console.warn('Échec lecture audio construit, son de test:', err)
        // Son de test de secours
        try {
          await engineRef.current.playVoice('test-beep')
          console.log('Son de test joué')
        } catch (err2) {
          console.error('Même le son de test a échoué:', err2)
        }
      }
      return
    }
    
    // Jouer à partir du trigger
    if (voiceTrigger?.src) {
      console.log('Lecture depuis trigger:', voiceTrigger.src)
      try {
        await engineRef.current.playVoice(voiceTrigger.src)
        console.log('Audio joué depuis trigger')
      } catch (err) {
        console.warn('Échec lecture trigger, son de test:', err)
        try {
          await engineRef.current.playVoice('test-beep')
          console.log('Son de test joué en secours')
        } catch (err2) {
          console.error('Son de test échoué:', err2)
        }
      }
    } else {
      // Secours final : son de test
      console.log('Aucune voix trouvée, génération d\'un son de test')
      try {
        await engineRef.current.playVoice('test-beep')
        console.log('Son de test final joué')
      } catch (err) {
        console.error('Impossible de jouer même un son de test:', err)
      }
    }
  }

  // Minimal paywall (client-side gate only; real security is server-side)
  useEffect(() => {
    if (!loading && ast) {
      // If chapter is paywalled and user not entitled (mock rule: chapterId !== '1')
      const isPaywalled = String(chapterId) !== '1'
      setPaywall(isPaywalled && !entitled)
    }
  }, [loading, ast, entitled, chapterId])

  // Evaluate triggers on page change (forward only)
  useEffect(() => {
    if (!ast?.triggers || !pages?.length) return
    if (navDir !== 'next') return // do not auto retrigger on back
    const engine = engineRef.current
    if (!engine) return
    // Only fire when context is running (after a user gesture)
    if (engine.state !== 'running') return
    const progress = Math.max(0, Math.min(1, (pageIndex + 1) / pages.length))
    const page = pages[pageIndex]
    const blockIds = new Set(page?.blocks?.map(b => b.id))

    for (const t of ast.triggers) {
      if (firedRef.current.has(t.id || `${t.kind}:${t.src}:${t.at}`)) continue
      const at = String(t.at || '')
      let shouldFire = false
      if (/^progress:/i.test(at)) {
        const p = parseFloat(at.split(':')[1] || '0')
        if (!isNaN(p) && progress >= p) shouldFire = true
      } else if (/^para:/i.test(at)) {
        const pid = at.split(':')[1]
        if (blockIds.has(pid)) shouldFire = true
      }
      if (shouldFire) {
        if (t.kind === 'cue' && t.src) engine.setCue(t.src, { fadeMs: 220, loop: t.loop !== false })
        else if (t.kind === 'sfx' && t.src) engine.playSfx(t.src)
        // voice not auto-fired
        firedRef.current.add(t.id || `${t.kind}:${t.src}:${t.at}`)
      }
    }
  }, [pageIndex, pages, ast, navDir, audioReady])

  return (
    <div className="reader" ref={containerRef}>
      {showSplash && splashData && (
        <ReaderSplash
          id={splashData.id || String(chapterId)}
          title={splashData.title || `Chapitre ${chapterId}`}
          img={splashData.img}
          ready={preloadDone}
          onFinished={() => { try { sessionStorage.setItem(`reader:splashSeen:${chapterId}`,'1') } catch {}; setShowSplash(false) }}
        />
      )}
      {!showSplash && !paywall && (
        <>
          <header className="reader__header">
            <div className="reader__header-left">
              <button className="reader__back" onClick={() => { window.location.hash = '#/' }}>← Retour</button>
            </div>
            <div className="reader__header-center">
              <div className="reader__book">{(ast?.title || 'À JAMAIS, POUR TOUJOURS')}</div>
              <div className="reader__page">{Math.max(1, Math.min(pageIndex + 1, pages?.length || 1))}/{pages?.length || 1}</div>
            </div>
            <div className="reader__header-right" />
          </header>
          <main className="reader__stage">
            {pages?.length > 0 && (
              <PageViewport
              key={pageIndex}
              page={pages[Math.max(0, Math.min(pageIndex, pages.length - 1))]}
              dir={navDir}
              readDialogIds={readDialogIds}
              onDialogueTap={handleDialogueTap}
              onSwipeNext={() => { setNavDir('next'); setPageIndex(i => Math.min(i + 1, pages.length - 1)) }}
              onSwipePrev={() => { setNavDir('prev'); setPageIndex(i => Math.max(i - 1, 0)) }}
              onDoubleTap={() => { setOverlayOpen(v => !v); engineRef.current?.ensureStarted() }}
              overlayOpen={overlayOpen}
              />
            )}
            {/* rails et boutons déplacés dans l'overlay */}
          </main>
          {overlayOpen && (
            <div
              className="reader__overlay"
              onClick={(e) => {
                const now = Date.now();
                if (now - overlayTapRef.current < 300) {
                  setOverlayOpen(false);
                  setOverlayTab('none');
                }
                overlayTapRef.current = now;
              }}
            >
              <div className="reader__overlay-topbar">
                <div className="reader__overlay-tools" style={{ marginLeft: 'auto' }}>
                  <button
                    className={`reader__icon ${bookmarked ? 'is-on' : ''}`}
                    aria-pressed={bookmarked}
                    onClick={() => setBookmarked(v => !v)}
                    title="Marque‑page"
                  >🔖</button>
                  <span className="reader__sep" aria-hidden>|</span>
                  <button
                    className={`reader__pill ${textBtn==='small' ? 'is-active' : ''}`}
                    onClick={() => {
                      if (textBtn==='small') { setTextBtn('none'); setFontScale(1) }
                      else { setTextBtn('small'); setFontScale(0.9) }
                    }}
                  >B</button>
                  <button
                    className={`reader__pill ${textBtn==='large' ? 'is-active' : ''}`}
                    onClick={() => {
                      if (textBtn==='large') { setTextBtn('none'); setFontScale(1) }
                      else { setTextBtn('large'); setFontScale(1.2) }
                    }}
                  >A+</button>
                  <button className="reader__pill" onClick={() => { setTextBtn('none'); setFontScale(1) }}>Aa</button>
                </div>
              </div>
              <div className="reader__overlay-rails">
                <button className="reader__theme" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title="Mode nuit / jour" aria-label="Mode nuit / jour">🌙</button>
                <MusicRail value={musicVolume} onChange={setMusicVolume} />
                <VoiceRail value={voiceVolume} onChange={setVoiceVolume} />
              </div>
              {overlayTab !== 'none' && (
                <div className="reader__carousel">
                  {Array.from({ length: pages?.length || 6 }, (_, i) => (
                    <div key={i} className="reader__thumb">
                      <div className="reader__thumb-img" />
                      <div className="reader__thumb-meta">
                        <span className="reader__thumb-title">Résignation</span>
                        <span className="reader__thumb-badge">{i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="reader__dock">
                <span className="reader__dock-ind">{pageIndex}</span>
                <button className={`reader__dock-btn ${overlayTab==='bookmark'?'is-active':''}`} onClick={() => setOverlayTab(t => t==='bookmark'?'none':'bookmark')}>MARQUE‑PAGE</button>
                <button className="reader__dock-home" onClick={() => { window.location.hash = '#/' }} aria-label="Accueil">🏠</button>
                <button className={`reader__dock-btn ${overlayTab==='chapters'?'is-active':''}`} onClick={() => setOverlayTab(t => t==='chapters'?'none':'chapters')}>CHAPITRAGE</button>
                <span className="reader__dock-ind">{(pages?.length || 1) - 1}</span>
              </div>
              {overlayTab === 'chapters' && (
                <div className="reader__panel">
                  <div className="reader__panel-title">Chapitrage</div>
                  <div className="reader__panel-grid">
                    {Array.from({ length: pages?.length || 1 }, (_, i) => (
                      <button key={i} className={`reader__cell ${i===pageIndex?'is-current':''}`} onClick={() => { setPageIndex(i); setOverlayOpen(false); setOverlayTab('none') }}>{i+1}</button>
                    ))}
                  </div>
                </div>
              )}
              {overlayTab === 'bookmark' && (
                <div className="reader__panel">
                  <div className="reader__panel-title">Marque‑page</div>
                  <div className="reader__panel-grid">
                    {/* placeholder */}
                    <div className="reader__cell is-current">{pageIndex+1}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {!showSplash && paywall && (
        <div className="reader__stage" style={{ display: 'grid', placeItems: 'center' }}>
          <div className="reader__paywall" style={{ textAlign: 'center' }}>
            <h2>Chapitre verrouillé</h2>
            <p>Ce chapitre nécessite l’achat du livre.</p>
            <button
              className="hero__cta"
              type="button"
              onClick={async () => {
                const url = await createCheckoutSession({ chapterId, taleId: 'tale1' })
                if (url) window.location.href = url
              }}
            >
              Acheter sur Stripe
            </button>
            <div style={{ marginTop: 12 }}>
              <button className="hero__bookmark" type="button" onClick={() => { window.location.hash = '#/' }}>Retour</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}






