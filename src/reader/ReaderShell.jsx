import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import ReaderSplash from './ReaderSplash.jsx'
import PageViewport from './PageViewport.jsx'
import { getAudioEngine } from './audioSingleton.js'
import { useChapter } from './useChapter.js'
import ChapterCarousel from './ChapterCarousel.jsx'
import { getEntitlements, createCheckoutSession, getSignedAudioUrl, getTales } from '../api/client.js'
import {
  getReaderPrefs,
  setReaderPrefs,
  getProgress,
  setProgress,
  getBookmarks,
  setBookmarks,
  getReadDialogues,
  setReadDialogues,
  getFiredTriggers,
  setFiredTriggers,
  getSessionFlag,
  setSessionFlag,
  getSessionData,
  setSessionData,
  removeSessionData
} from '../utils/storage.ts'

// Guard to avoid double splash in React StrictMode
let lastSplashGuard = { id: null, ts: 0 }
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
const clampFontDelta = (value) => Math.max(0, Math.min(6, Number.isFinite(value) ? value : 0))
const PRIMARY_FONT_STACK = "'Playfair Display','EB Garamond',serif"
const ALT_FONT_STACK = "'EB Garamond','Playfair Display',serif"
const formatSnippet = (value, limit = 120) => {
  if (typeof value !== 'string') return ''
  const clean = value.replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  if (clean.length <= limit) return clean
  return `${clean.slice(0, Math.max(0, limit - 1)).trim()}…`
}
const getPagePreview = (page) => {
  const blocks = page?.blocks
  if (!Array.isArray(blocks)) return ''
  const block = blocks.find((entry) => typeof entry?.text === 'string' && entry.text.trim())
  return formatSnippet(block?.text || '')
}
const formatBookmarkDate = (ts) => {
  if (!ts) return 'Signet sauvegardé'
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts))
  } catch {
    return 'Signet sauvegardé'
  }
}
const VolumeKnob = ({ label, value, onChange, onToggleMute }) => {
  const knobRef = useRef(null)
  const dragRef = useRef(null)
  const moveListenerRef = useRef(null)
  const upListenerRef = useRef(null)
  const cancelListenerRef = useRef(null)
  const percent = Math.round(clamp01(value) * 100)
  const size = 52
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const stopTracking = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (moveListenerRef.current) {
        window.removeEventListener('pointermove', moveListenerRef.current)
        moveListenerRef.current = null
      }
      if (upListenerRef.current) {
        window.removeEventListener('pointerup', upListenerRef.current)
        upListenerRef.current = null
      }
      if (cancelListenerRef.current) {
        window.removeEventListener('pointercancel', cancelListenerRef.current)
        cancelListenerRef.current = null
      }
    }
    dragRef.current = null
  }, [])

  useEffect(() => stopTracking, [stopTracking])

  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0) return
    e.preventDefault()
    if (typeof window === 'undefined') return
    const state = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startValue: clamp01(value)
    }
    dragRef.current = state
    const handleMove = (evt) => {
      if (!dragRef.current || dragRef.current.pointerId !== evt.pointerId) return
      evt.preventDefault()
      const delta = (dragRef.current.startY - evt.clientY) / 160
      const nextValue = clamp01(dragRef.current.startValue + delta)
      onChange(Math.round(nextValue * 100) / 100)
    }
    const handleUp = (evt) => {
      if (!dragRef.current || dragRef.current.pointerId !== evt.pointerId) return
      stopTracking()
    }
    moveListenerRef.current = handleMove
    upListenerRef.current = handleUp
    cancelListenerRef.current = handleUp
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
  }, [onChange, stopTracking, value])

  const dashOffset = circumference * (1 - clamp01(value))

  return (
    <div className="reader__potard-cell">
      <span className="reader__potard-name">{label}</span>
      <div
        ref={knobRef}
        className="reader__potard"
        role="slider"
        aria-label={`${label}: ${percent}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent} pour cent`}
        onPointerDown={handlePointerDown}
      >
        <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              className="reader__potard-track"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
            />
            <circle
              className="reader__potard-arc"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </g>
        </svg>
        <button
          type="button"
          className="reader__potard-toggle"
          onClick={(evt) => { evt.stopPropagation(); onToggleMute() }}
          onPointerDown={(evt) => evt.stopPropagation()}
          aria-label={value <= 0 ? `Réactiver ${label}` : `Couper ${label}`}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M5 9v6h3l4 4V5L8 9H5zm10.5 3a2.5 2.5 0 0 0-1.5-2.291V14.29A2.5 2.5 0 0 0 15.5 12zm1.5 0c0 1.841-1.003 3.413-2.5 4.237v-8.47C16.497 8.586 17 10.158 17 12z"
            />
          </svg>
        </button>
      </div>
      <span className="reader__potard-value">{percent}%</span>
    </div>
  )
}

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = getReaderPrefs()
    if (stored.theme === 'dark' || stored.theme === 'light') return stored.theme
  } catch {}
  try {
    if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) return 'dark'
  } catch {}
  return 'light'
}

export default function ReaderShell({ chapterId, baseUrl }) {
  const taleId = 'tale1'
  const [overlayOpen, setOverlayOpen] = useState(false)
  const overlayRef = useRef(null)
  const [splashData, setSplashData] = useState(null)
  const [preloadDone, setPreloadDone] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const containerRef = useRef(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [musicVolume, setMusicVolume] = useState(0.5)
  const [voiceVolume, setVoiceVolume] = useState(0.6)
  const [readDialogIds, setReadDialogIds] = useState(new Set())
  const [activeDialogueId, setActiveDialogueId] = useState(null)
  const [navDir, setNavDir] = useState('next')
  const engineRef = useRef(null)
  const [entitled, setEntitled] = useState(true)
  const [paywall, setPaywall] = useState(null)
  const firedRef = useRef(new Set())
  const [audioReady, setAudioReady] = useState(false)
  const [audioPrimed, setAudioPrimed] = useState(() => getSessionFlag('audio:primed'))
  const [fontDelta, setFontDelta] = useState(0)
  const [fontFamily, setFontFamily] = useState('playfair')
  const [boldBody, setBoldBody] = useState(false)
  const [theme, setTheme] = useState(() => getInitialTheme())
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [overlayTab, setOverlayTab] = useState('none')
  const overlayTapRef = useRef(0)
  const bookmarkPulseTimer = useRef(null)
  const autoChainActiveRef = useRef(false)
  const carouselRef = useRef(null)
  const musicLastVolume = useRef(0.5)
  const voiceLastVolume = useRef(0.6)
  const overlayAnimTimer = useRef(null)
  const [bookmarkPulse, setBookmarkPulse] = useState(false)
  const [overlayRendered, setOverlayRendered] = useState(false)
  const [overlayPhase, setOverlayPhase] = useState('closed')
  const [carouselNav, setCarouselNav] = useState({ prev: false, next: false })
  const lastCueRef = useRef({ src: null, pageIndex: -1 })
  const overlaySwipeState = useRef({ pointerId: null, startY: 0, active: false })
  const overlayTitleId = useId()
  const overlayDescId = useId()

  // État pour stocker les métadonnées de tous les chapitres
  const [allChapters, setAllChapters] = useState([])

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false)
    setOverlayTab('none')
  }, [])
  const readerStyle = useMemo(() => ({
    '--reader-font-delta': `${fontDelta}px`,
    '--reader-font-family': fontFamily === 'garamond' ? ALT_FONT_STACK : PRIMARY_FONT_STACK,
    '--reader-font-weight': boldBody ? 600 : 400
  }), [fontDelta, fontFamily, boldBody])
  const isBoldActive = boldBody
  const isScaleActive = fontDelta >= 1
  const isAltFontActive = fontFamily === 'garamond'
  const textControlsAllActive = isBoldActive && isScaleActive && isAltFontActive
  const requestOverlay = useCallback((intent = 'toggle') => {
    if (intent === 'open') {
      setOverlayOpen(true)
      try { engineRef.current?.ensureStarted() } catch {}
      return
    }
    if (intent === 'toggle') {
      setOverlayOpen(prev => {
        const next = !prev
        if (next) {
          try { engineRef.current?.ensureStarted() } catch {}
        } else {
          setOverlayTab('none')
        }
        return next
      })
      return
    }
    closeOverlay()
  }, [closeOverlay])
  // Focus trap + Esc for overlay
  useEffect(() => {
    if (!overlayOpen) return
    const root = overlayRef.current
    if (!root) return
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const getNodes = () => Array.from(root.querySelectorAll(selector)).filter(el => !el.hasAttribute('disabled'))
    const first = () => getNodes()[0]
    const last = () => getNodes().slice(-1)[0]
    first()?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeOverlay(); return }
      if (e.key === 'Tab') {
        const f = first(), l = last()
        if (!f || !l) return
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus() }
        else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus() }
      }
    }
    const onFocusIn = (e) => { if (!root.contains(e.target)) first()?.focus() }
    root.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocusIn)
    return () => { root.removeEventListener('keydown', onKey); document.removeEventListener('focusin', onFocusIn) }
  }, [closeOverlay, overlayOpen])

  // Load persisted preferences once
  useEffect(() => {
    try {
      const stored = getReaderPrefs()
      if (typeof stored.musicVolume === 'number') setMusicVolume(clamp01(stored.musicVolume))
      if (typeof stored.voiceVolume === 'number') setVoiceVolume(clamp01(stored.voiceVolume))
      if (typeof stored.fontDelta === 'number') setFontDelta(clampFontDelta(stored.fontDelta))
      if (stored.fontFamily === 'garamond' || stored.fontFamily === 'playfair') setFontFamily(stored.fontFamily)
      if (typeof stored.boldBody === 'boolean') setBoldBody(stored.boldBody)
      if (stored.theme === 'dark' || stored.theme === 'light') setTheme(stored.theme)
    } catch {}
  }, [])

  // Persist preferences on change
  useEffect(() => {
    setReaderPrefs({ musicVolume, voiceVolume, fontDelta, fontFamily, boldBody, theme })
  }, [musicVolume, voiceVolume, fontDelta, fontFamily, boldBody, theme])

  // Scope body mode
  useEffect(() => {
    try { document.body.dataset.mode = 'reader' } catch {}
    return () => { try { document.body.dataset.mode = 'hub' } catch {} }
  }, [])

  // Splash: once per session and per chapter
  useEffect(() => {
    try {
      const already = getSessionFlag(`splash:seen:${chapterId}`)
      const raw = getSessionData('splash:data')
      if (raw && !already) {
        const now = Date.now()
        const dup = lastSplashGuard.id === String(chapterId) && (now - lastSplashGuard.ts) < 3000
        if (!dup) {
          lastSplashGuard = { id: String(chapterId), ts: now }
          setSplashData(raw)
          setShowSplash(true)
        }
      }
      removeSessionData('splash:data')
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
  useEffect(() => { engineRef.current = getAudioEngine() }, [])
  useEffect(() => { engineRef.current?.setMusicVolume(musicVolume) }, [musicVolume])
  useEffect(() => { engineRef.current?.setVoiceVolume?.(voiceVolume) }, [voiceVolume])
  useEffect(() => {
    if (musicVolume > 0) musicLastVolume.current = musicVolume
  }, [musicVolume])
  useEffect(() => {
    if (voiceVolume > 0) voiceLastVolume.current = voiceVolume
  }, [voiceVolume])

  // Reset modules when overlay closes
  useEffect(() => {
    if (!overlayOpen) setOverlayTab('none')
  }, [overlayOpen])
  useEffect(() => {
    if (overlayOpen) {
      if (overlayAnimTimer.current) clearTimeout(overlayAnimTimer.current)
      setOverlayRendered(true)
      requestAnimationFrame(() => setOverlayPhase('enter'))
    } else if (overlayRendered) {
      setOverlayPhase('exit')
      overlayAnimTimer.current = setTimeout(() => {
        setOverlayRendered(false)
        setOverlayPhase('closed')
      }, 200)
    } else {
      setOverlayPhase('closed')
    }
    return () => {
      if (overlayAnimTimer.current) {
        clearTimeout(overlayAnimTimer.current)
        overlayAnimTimer.current = null
      }
    }
  }, [overlayOpen, overlayRendered])
  useEffect(() => {
    if (!overlayRendered) return
    const root = overlayRef.current
    if (!root) return
    const state = overlaySwipeState.current
    const onDown = (e) => {
      if (!overlayOpen) return
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return
      if (e.target?.closest?.('[data-overlay-swipe-lock="true"]')) return
      state.pointerId = e.pointerId
      state.startY = e.clientY
      state.active = true
    }
    const onMove = (e) => {
      if (!state.active || e.pointerId !== state.pointerId) return
      const dy = e.clientY - state.startY
      if (dy > 28) {
        state.active = false
        state.pointerId = null
        requestOverlay('close')
      }
    }
    const onEnd = (e) => {
      if (state.pointerId !== null && e.pointerId === state.pointerId) {
        state.pointerId = null
        state.active = false
      }
    }
    root.addEventListener('pointerdown', onDown, { passive: true })
    root.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerup', onEnd, { passive: true })
    root.addEventListener('pointercancel', onEnd, { passive: true })
    return () => {
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerup', onEnd)
      root.removeEventListener('pointercancel', onEnd)
    }
  }, [overlayRendered, overlayOpen, requestOverlay])

  useEffect(() => {
    const on = () => {
      setAudioPrimed(true)
      setSessionFlag('audio:primed', true)
    }
    window.addEventListener("audio:primed", on)
    return () => window.removeEventListener("audio:primed", on)
  }, [])
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
  const { loading, error, ast, pages } = useChapter({ taleId, chapterId, baseUrl })
  const pageCount = pages?.length || 0
  const progressRatio = pageCount ? ((pageIndex + 1) / pageCount) : 0
  const currentPage = useMemo(() => {
    if (!pages?.length) return null
    const safeIndex = Math.max(0, Math.min(pageIndex, pages.length - 1))
    return pages[safeIndex]
  }, [pages, pageIndex])
  const pageDialogues = useMemo(() => {
    if (!currentPage?.blocks?.length) return []
    return currentPage.blocks.filter((block) => (
      block?.kind === 'dialogue' || block?.type === 'dialogue'
    ))
  }, [currentPage])
  const hasPages = pageCount > 0
  const isFirstPage = pageIndex <= 0
  const isLastPage = hasPages ? pageIndex >= (pageCount - 1) : false
  const prevPageLabel = hasPages ? Math.max(1, Math.min(pageCount, pageIndex)) : 1
  const nextPageLabel = hasPages ? Math.min(pageCount, pageIndex + 2) : Math.max(1, pageIndex + 2)
  const homeLogoSrc = theme === 'light' ? '/logo-clair.svg' : '/logo-sombre.svg'
  const showCarousel = overlayTab !== 'none'
  const getPageCueSrc = useCallback((page) => {
    if (!page) return null
    const amb = page.ambience || page.audio?.ambience
    if (!amb) return null
    if (typeof amb === 'string') return amb
    if (typeof amb?.cue === 'string') return amb.cue
    if (typeof amb?.src === 'string') return amb.src
    return null
  }, [])
  const carouselItems = useMemo(() => {
    if (overlayTab === 'chapters') {
      return allChapters.map((ch, index) => ({
        id: `chapter-${ch.id}`,
        kind: 'chapter',
        chapterId: ch.id,
        index,
        badge: parseInt(ch.id, 10) || index + 1,
        title: ch.title,
        img: ch.img,
        snippet: '', // optionnel: ajouter description si disponible
        ariaLabel: `Aller au chapitre ${ch.id}: ${ch.title}`
      }))
    }
    if (overlayTab === 'bookmark') {
      return bookmarks.map((bm, index) => ({
        id: bm.id || `bookmark-${index}`,
        kind: 'bookmark',
        bookmark: bm,
        chapterId: bm.chapterId,
        badge: parseInt(bm.chapterId, 10) || index + 1,
        title: allChapters.find(ch => ch.id === bm.chapterId)?.title || `Chapitre ${bm.chapterId}`,
        img: allChapters.find(ch => ch.id === bm.chapterId)?.img || '',
        snippet: formatBookmarkDate(bm.ts),
        ariaLabel: `Restaurer le signet chapitre ${bm.chapterId}, page ${(bm.pageIndex ?? 0) + 1}`
      }))
    }
    return []
  }, [overlayTab, allChapters, bookmarks])

  const resolveVoiceSource = useCallback(async (src) => {
    if (!src) return null
    try {
      const signed = await getSignedAudioUrl({ type: 'voice', resource: src, taleId, chapterId })
      if (signed) return signed
    } catch {}
    const cleaned = src.replace(/^\/+/, '')
    if (/^https?:/i.test(src) || src.startsWith('/')) return src
    if (baseUrl) {
      const root = baseUrl.replace(/\/+$/, '')
      return `${root}/${cleaned}`
    }
    return src
  }, [baseUrl, chapterId, taleId])

  const resolveCueSource = useCallback((src) => {
    if (!src) return null
    if (/^https?:/i.test(src) || src.startsWith('/')) return src
    if (baseUrl) {
      const root = baseUrl.replace(/\/+$/, '')
      return `${root}/${src.replace(/^\/+/, '')}`
    }
    return src
  }, [baseUrl])

  const handleDialogueTap = useCallback(async (id, providedBlock = null, options = {}) => {
    const { auto = false, pageRef = pageIndex } = options || {}
    if (!id) return
    const engine = engineRef.current
    if (!engine) return
    if (!auto) {
      autoChainActiveRef.current = false
    }
    const voiceState = engine.getVoiceState?.() || null
    if (voiceState?.metaId === id) {
      if (voiceState.status === 'playing') {
        try { engine.pauseVoice?.() } catch {}
        setActiveDialogueId(id)
        return
      }
      if (voiceState.status === 'paused') {
        try { await engine.resumeVoice?.() } catch {}
        return
      }
    }
    setReadDialogIds(prev => new Set([...prev, id]))
    try { await engine.ensureStarted() } catch {}
    const dialogue = providedBlock
      || currentPage?.blocks?.find(block => block.id === id)
      || ast?.blocks?.find(block => block.id === id)
    if (!dialogue) return
    setActiveDialogueId(id)
    const voiceTrigger = ast?.triggers?.find(t => (
      t.kind === 'voice' && (
        t.at === `dialogue:${id}` ||
        t.id === dialogue.voice ||
        t.at === dialogue.voice
      )
    ))
    const fallbackRef = dialogue.voice ? `audio/voices/${dialogue.voice}.mp3` : null
    const targetRef = voiceTrigger?.src || fallbackRef
    const resolved = await resolveVoiceSource(targetRef)
    if (!resolved) {
      setActiveDialogueId(current => current === id ? null : current)
      return
    }
    const dialoguesOnPage = pageDialogues
    const blockIndex = dialoguesOnPage.findIndex((block) => block.id === id)
    try {
      await engine.playVoice(resolved, { metaId: id })
    } catch (err) {
      console.warn('[Reader] Lecture voix impossible', err)
    } finally {
      setActiveDialogueId(current => current === id ? null : current)
      if (auto && autoChainActiveRef.current) {
        const samePage = pageRef === pageIndex
        if (samePage && blockIndex >= 0) {
          const nextBlock = dialoguesOnPage[blockIndex + 1]
          if (nextBlock) {
            requestAnimationFrame(() => {
              handleDialogueTap(nextBlock.id, nextBlock, { auto: true, pageRef })
            })
            return
          }
        }
        autoChainActiveRef.current = false
      }
    }
  }, [ast, chapterId, currentPage, pageDialogues, pageIndex, resolveVoiceSource])

  const toggleMusicMute = useCallback(() => {
    setMusicVolume((prev) => {
      if (prev <= 0.001) {
        const restored = musicLastVolume.current > 0 ? musicLastVolume.current : 0.5
        return clamp01(restored)
      }
      musicLastVolume.current = prev || musicLastVolume.current || 0.5
      return 0
    })
  }, [])

  const toggleVoiceMute = useCallback(() => {
    setVoiceVolume((prev) => {
      if (prev <= 0.001) {
        const restored = voiceLastVolume.current > 0 ? voiceLastVolume.current : 0.6
        return clamp01(restored)
      }
      voiceLastVolume.current = prev || voiceLastVolume.current || 0.6
      return 0
    })
  }, [])
  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    } else {
      document.documentElement?.requestFullscreen?.().catch(() => {})
    }
  }, [])
  const activateOverlayTab = useCallback((tab) => {
    if (!tab) return
    if (overlayOpen && overlayTab === tab) {
      closeOverlay()
      return
    }
    setOverlayTab(tab)
    if (!overlayOpen) requestOverlay('open')
  }, [closeOverlay, overlayOpen, overlayTab, requestOverlay])

  // --- Bookmarks (per chapter) ---
  const loadBookmarks = useCallback(() => {
    return getBookmarks(taleId, chapterId)
  }, [taleId, chapterId])

  const persistBookmarks = useCallback((items) => {
    setBookmarks(taleId, chapterId, items)
  }, [taleId, chapterId])

  useEffect(() => { setBookmarks(loadBookmarks()) }, [loadBookmarks])
  useEffect(() => {
    setBookmarked(bookmarks.some(b => b.pageIndex === pageIndex))
  }, [bookmarks, pageIndex])

  const captureBookmarkSnapshot = useCallback(() => {
    const audioSnapshot = engineRef.current?.getSnapshot?.() || null
    return {
      id: `bm-${Date.now()}-${pageIndex}`,
      chapterId: String(chapterId),
      pageIndex,
      ts: Date.now(),
      dialogues: Array.from(readDialogIds),
      theme,
      fontFamily,
      fontDelta,
      boldBody,
      music: clamp01(musicVolume),
      voice: clamp01(voiceVolume),
      triggers: Array.from(firedRef.current || []),
      audio: audioSnapshot
    }
  }, [chapterId, pageIndex, readDialogIds, theme, fontFamily, fontDelta, boldBody, musicVolume, voiceVolume])

  const restoreBookmarkSnapshot = useCallback((bookmark) => {
    setPageIndex(bookmark.pageIndex)
    setReadDialogIds(new Set(bookmark.dialogues || []))
    if (bookmark.fontFamily === 'garamond' || bookmark.fontFamily === 'playfair') setFontFamily(bookmark.fontFamily)
    if (typeof bookmark.fontDelta === 'number') setFontDelta(clampFontDelta(bookmark.fontDelta))
    else if (typeof bookmark.fontScale === 'number') setFontDelta(bookmark.fontScale > 1.01 ? 2 : 0)
    setBoldBody(Boolean(bookmark.boldBody))
    setMusicVolume(clamp01(bookmark.music ?? musicVolume))
    setVoiceVolume(clamp01(bookmark.voice ?? voiceVolume))
    if (bookmark.theme === 'dark' || bookmark.theme === 'light') setTheme(bookmark.theme)
    firedRef.current = new Set(bookmark.triggers || [])
    const cueSrc = bookmark.audio?.music?.src
    if (cueSrc) {
      try { engineRef.current?.setCue?.(cueSrc, { fadeMs: 180, loop: true }) } catch {}
    }
  }, [musicVolume, voiceVolume])

  const toggleBookmarkCurrent = useCallback(() => {
    setBookmarks(prev => {
      const existing = prev.find(b => b.pageIndex === pageIndex)
      if (existing) {
        const next = prev.filter(b => b.pageIndex !== pageIndex)
        persistBookmarks(next)
        return next
      }
      const snapshot = captureBookmarkSnapshot()
      const next = [...prev.filter(b => b.pageIndex !== pageIndex), snapshot].sort((a, b) => a.pageIndex - b.pageIndex)
      persistBookmarks(next)
      setBookmarkPulse(true)
      if (bookmarkPulseTimer.current) clearTimeout(bookmarkPulseTimer.current)
      bookmarkPulseTimer.current = setTimeout(() => setBookmarkPulse(false), 420)
      return next
    })
  }, [captureBookmarkSnapshot, persistBookmarks, pageIndex])
  const updateCarouselNav = useCallback(() => {
    const el = carouselRef.current
    if (!el) {
      setCarouselNav({ prev: false, next: false })
      return
    }
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
    if (maxScroll <= 2) {
      setCarouselNav({ prev: false, next: false })
      return
    }
    const threshold = 4
    const prev = el.scrollLeft > threshold
    const next = (maxScroll - el.scrollLeft) > threshold
    setCarouselNav({ prev, next })
  }, [])
  const scrollCarousel = useCallback((direction = 'next') => {
    const el = carouselRef.current
    if (!el) return
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches
    const cardsPerView = isDesktop ? 3 : 2
    const firstCard = el.querySelector('.reader__thumb')
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : (el.clientWidth / Math.max(cardsPerView, 1))
    let gap = isDesktop ? 20 : 16
    if (typeof window !== 'undefined') {
      const style = window.getComputedStyle(el)
      const rawGap = parseFloat(style.columnGap || style.getPropertyValue('gap') || '0')
      if (Number.isFinite(rawGap) && rawGap > 0) gap = rawGap
    }
    const delta = (cardWidth + gap) * cardsPerView
    el.scrollBy({ left: direction === 'next' ? delta : -delta, behavior: 'smooth' })
  }, [])
  const handleCarouselItemClick = useCallback((item) => {
    if (!item) return
    if (item.kind === 'chapter') {
      const targetChapterId = item.chapterId
      if (String(targetChapterId) === String(chapterId)) {
        closeOverlay()
        return
      }
      // Naviguer vers le nouveau chapitre
      const img = item.img || `https://picsum.photos/800/450?random=${targetChapterId}`
      const payload = { id: String(targetChapterId), img, title: ast?.title || 'Chapitre' }
      try {
        sessionStorage.setItem('reader:splash', JSON.stringify(payload))
        sessionStorage.removeItem('reader:resume')
      } catch {}
      window.location.hash = `#/reader/${targetChapterId}`
      closeOverlay()
      return
    }
    if (item.kind === 'bookmark' && item.bookmark) {
      if (String(item.bookmark.chapterId) === String(chapterId)) {
        // Même chapitre: restaurer snapshot
        restoreBookmarkSnapshot(item.bookmark)
        closeOverlay()
      } else {
        // Autre chapitre: naviguer + restaurer
        const targetChapterId = item.bookmark.chapterId
        const img = item.img || `https://picsum.photos/800/450?random=${targetChapterId}`
        const payload = { id: String(targetChapterId), img, title: item.title }
        try {
          sessionStorage.setItem('reader:splash', JSON.stringify(payload))
          sessionStorage.setItem('reader:resume', JSON.stringify({ 
            chapterId: targetChapterId, 
            pageIndex: item.bookmark.pageIndex || 0 
          }))
        } catch {}
        window.location.hash = `#/reader/${targetChapterId}`
      }
    }
  }, [ast, chapterId, closeOverlay, restoreBookmarkSnapshot])

  // Toggle light/dark mode
  const handleThemeToggle = useCallback(() => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'))
  }, [])

  // Audio prompt test beep
  const handleTestBeep = useCallback(async () => {
    try { await engineRef.current?.ensureStarted() } catch {}
    try { await engineRef.current?.playSfx?.('test-beep') } catch {}
  }, [])

  // Navigation handlers

  // --- Effects ---

  // Close overlay on outside click
  useEffect(() => {
    if (!overlayOpen) return
    const handleClickOutside = (e) => {
      const root = overlayRef.current
      if (root && !root.contains(e.target)) {
        e.preventDefault()
        closeOverlay()
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [closeOverlay, overlayOpen])

  // Charger les métadonnées de tous les chapitres du tale au montage
  useEffect(() => {
    let alive = true
    const loadChapters = async () => {
      try {
        const data = await getTales({ baseUrl })
        if (!alive) return
        const tale = data?.tales?.find(t => t.id === taleId)
        if (tale?.chapters) {
          setAllChapters(tale.chapters.map(ch => ({
            id: String(ch.id),
            title: ch.title || `Chapitre ${ch.id}`,
            img: ch.cover || tale.cover || `https://picsum.photos/800/450?random=${ch.id}`
          })))
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[ReaderShell] Échec chargement chapitres:', err)
        }
      }
    }
    loadChapters()
    return () => { alive = false }
  }, [taleId, baseUrl])

  // Reset last cue on chapter change
  useEffect(() => {
    lastCueRef.current = { src: null, pageIndex: -1 }
  }, [chapterId])
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !pages?.length) return
    const page = currentPage
    const cueRaw = getPageCueSrc(page)
    if (!cueRaw) {
      lastCueRef.current = { src: null, pageIndex }
      return
    }
    const resolved = resolveCueSource(cueRaw)
    if (!resolved) return
    const last = lastCueRef.current
    const same = last.src === resolved
    if (!same) {
      const adjacent = last.pageIndex >= 0 ? Math.abs(pageIndex - last.pageIndex) === 1 : false
      const fadeMs = !last.src ? 200 : (adjacent ? 0 : 200)
      engine.ensureStarted?.()
      engine.setCue?.(resolved, { fadeMs, loop: true })
      lastCueRef.current = { src: resolved, pageIndex }
    }
    const nextRaw = getPageCueSrc(pages[pageIndex + 1])
    if (nextRaw) {
      const resolvedNext = resolveCueSource(nextRaw)
      if (resolvedNext) engine.prefetch?.(resolvedNext)
    }
  }, [pageIndex, pages, currentPage, getPageCueSrc, resolveCueSource])
  const handleOverlayPointerDown = useCallback((e) => {
    if (typeof e.button === 'number' && e.button !== 0) return
    const surface = e.currentTarget.querySelector('.reader__overlay-surface')
    if (!surface) return
    if (!surface.contains(e.target)) {
      e.preventDefault()
      closeOverlay()
      return
    }
    const pointerType = e.pointerType || 'mouse'
    const allowDoubleTap = pointerType === 'touch' || pointerType === 'pen'
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (allowDoubleTap && (now - overlayTapRef.current) < 280) {
      e.preventDefault()
      closeOverlay()
      overlayTapRef.current = 0
      return
    }
    overlayTapRef.current = allowDoubleTap ? now : 0
  }, [closeOverlay])
  const clearAllBookmarks = useCallback(() => {
    persistBookmarks([])
    setBookmarks([])
  }, [persistBookmarks])

  useEffect(() => {
    return () => {
      if (bookmarkPulseTimer.current) clearTimeout(bookmarkPulseTimer.current)
    }
  }, [])
  useEffect(() => {
    if (!showCarousel) {
      setCarouselNav({ prev: false, next: false })
      return
    }
    const el = carouselRef.current
    if (!el) return
    const handleScroll = () => updateCarouselNav()
    const handleResize = () => updateCarouselNav()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
    requestAnimationFrame(() => {
      try { el.scrollTo({ left: 0, behavior: 'auto' }) } catch { el.scrollLeft = 0 }
      updateCarouselNav()
    })
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [showCarousel, overlayTab, carouselItems.length, updateCarouselNav])

  // Resume to requested page if provided by hub
  useEffect(() => {
    try {
      const r = getSessionData('resume:data')
      if (!r) return
      if (String(r?.chapterId || '') !== String(chapterId)) return
      const idx = Math.max(0, parseInt(r?.pageIndex || 0, 10) || 0)
      setPageIndex(idx)
      removeSessionData('resume:data')
    } catch {}
  }, [chapterId])

  // Persist precise reading progress (chapter + page)
  useEffect(() => {
    try {
      setProgress(taleId, { chapterId: String(chapterId), pageIndex: Math.max(0, pageIndex), ts: Date.now() })
    } catch {}
  }, [taleId, chapterId, pageIndex])
  useEffect(() => {
    autoChainActiveRef.current = false
  }, [pageIndex, chapterId])

  const handleSpaceKey = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    const voiceState = engine.getVoiceState?.() || null
    if (voiceState?.status === 'playing') {
      try { engine.pauseVoice?.() } catch {}
      return
    }
    if (voiceState?.status === 'paused') {
      autoChainActiveRef.current = true
      Promise.resolve(engine.resumeVoice?.()).catch(() => {})
      setActiveDialogueId(voiceState.metaId || null)
      return
    }
    const dialogues = pageDialogues
    if (!dialogues.length) return
    const unreadIndex = dialogues.findIndex(block => !readDialogIds.has(block.id))
    const nextBlock = dialogues[Math.max(0, unreadIndex)]
    if (!nextBlock) return
    autoChainActiveRef.current = true
    handleDialogueTap(nextBlock.id, nextBlock, { auto: true, pageRef: pageIndex })
  }, [handleDialogueTap, pageDialogues, pageIndex, readDialogIds])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return
      if (e.deltaY < -6) {
        e.preventDefault()
        requestOverlay('open')
      } else if (e.deltaY > 6) {
        e.preventDefault()
        requestOverlay('close')
      }
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [requestOverlay])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      const target = e.target
      if (!target) return
      const tag = target.tagName
      if ((tag && /^(INPUT|TEXTAREA|SELECT)$/i.test(tag)) || target.isContentEditable) return
      e.preventDefault()
      handleSpaceKey()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSpaceKey])

  // Autoplay best-effort: dès que l'AST est chargé, tenter de lancer la première boucle
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

  // Prefetch audio for current and next page to minimize latency
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !ast?.triggers || !pages?.length) return
    const uniq = new Set()
    // Dynamic prefetch budget based on network conditions
    let __pfBudget = 12
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (conn?.saveData) __pfBudget = 4
      else if (typeof conn?.effectiveType === 'string') {
        const et = conn.effectiveType.toLowerCase()
        if (et.includes('2g') || et.includes('slow-2g')) __pfBudget = 4
        else if (et.includes('3g')) __pfBudget = 8
      }
    } catch {}
    const add = (src) => {
      if (!src) return
      if (uniq.has(src)) return
      if (uniq.size >= __pfBudget) return
      uniq.add(src)
      engine.prefetch?.(src)
    }

    const current = pages[Math.max(0, Math.min(pageIndex, pages.length - 1))]
    const next = pages[Math.max(0, Math.min(pageIndex + 1, pages.length - 1))]
    const curIds = new Set(current?.blocks?.map(b => b.id))
    const nextIds = new Set(next?.blocks?.map(b => b.id))

    for (const t of (ast.triggers || [])) {
      if (!t?.src) continue
      const at = String(t.at || '')
      if (t.kind === 'sfx') {
        // SFX de la page courante et suivante
        if ((/^para:/i.test(at) || /^dialogue:/i.test(at))) {
          const id = at.split(':')[1]
          if (curIds.has(id) || nextIds.has(id)) add(t.src)
        }
      } else if (t.kind === 'voice') {
        // Précharger voix associées aux dialogues visibles ou imminents
        if (/^dialogue:/i.test(at)) {
          const id = at.split(':')[1]
          if (curIds.has(id) || nextIds.has(id)) add(t.src)
        }
      } else if (t.kind === 'cue') {
        // Précharger toutes les boucles (le nombre est limité) pour des crossfades sans latence
        add(t.src)
      }
    }
  }, [ast, pages, pageIndex])

  return (
    <div className="reader" ref={containerRef} data-theme={theme} style={readerStyle}>
      {showSplash && splashData && (
        <ReaderSplash
          id={splashData.id || String(chapterId)}
          title={splashData.title || `Chapitre ${chapterId}`}
          img={splashData.img}
          ready={preloadDone}
          theme={theme}
          onFinished={() => { 
            setSessionFlag(`splash:seen:${chapterId}`, true)
            setShowSplash(false) 
          }}
        />
      )}
      {!showSplash && !paywall && (
        <>
          <header className="reader__header">
            <div className="reader__header-left" />
            <div className="reader__header-center">
              <div className="reader__book">{(ast?.title || '\u00C0 JAMAIS, POUR TOUJOURS')}</div>
              <div className="reader__page">{Math.max(1, Math.min(pageIndex + 1, pages?.length || 1))}/{pages?.length || 1}</div>
            </div>
            <div className="reader__header-right" />
          </header>
          <main className="reader__stage">
      {!audioPrimed && (
        <div className="reader__audio-prompt" role="dialog" aria-live="polite">
          <button
            type="button"
            onClick={async () => {
              try { await engineRef.current?.ensureStarted() } catch {}
              setAudioPrimed(true)
            }}
          >Activer le son</button>
          <button
            type="button"
            style={{ marginLeft: 8 }}
            onClick={async () => {
              try { await engineRef.current?.ensureStarted() } catch {}
              try { await engineRef.current?.playSfx?.('test-beep') } catch {}
            }}
            aria-label="Jouer un bip de test"
          >Tester un bip</button>
        </div>
      )}
            {pages?.length > 0 && currentPage && (
              <PageViewport
                key={pageIndex}
                page={currentPage}
                dir={navDir}
                readDialogIds={readDialogIds}
                activeDialogueId={activeDialogueId}
                chapterTitle={ast?.title || ''}
                pageIndex={pageIndex}
                pageCount={pageCount}
                onDialogueTap={handleDialogueTap}
                onSwipeNext={() => { setNavDir('next'); setPageIndex(i => Math.min(i + 1, pages.length - 1)) }}
                onSwipePrev={() => { setNavDir('prev'); setPageIndex(i => Math.max(i - 1, 0)) }}
                overlayOpen={overlayOpen}
                onPrimeAudio={() => { engineRef.current?.ensureStarted() }}
                onOverlayGesture={requestOverlay}
              />
            )}
            {pageCount > 0 && overlayOpen && (
              <div
                className="reader__progress"
                role="progressbar"
                aria-label="Progression de lecture"
                aria-valuemin={0}
                aria-valuemax={pageCount}
                aria-valuenow={Math.min(pageCount, pageIndex + 1)}
              >
                <span className="reader__progress-fill" style={{ width: `${Math.max(0, Math.min(100, progressRatio * 100))}%` }} />
              </div>
            )}
            {/* rails et boutons déplacés dans l'overlay */}
          </main>
          {overlayRendered && (
            <div
              className="reader__overlay"
              data-phase={overlayPhase}
              ref={overlayRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={overlayTitleId}
              aria-describedby={overlayDescId}
              onPointerDown={handleOverlayPointerDown}
            >
              <div className="reader__overlay-surface">
                <div className="reader__overlay-top">
                  <header className="reader__overlay-topbar reader__ui-row" data-row="0" data-overlay-swipe-lock="true">
                  <span id={overlayTitleId} className="reader__overlay-heading">R\u00E9glages de lecture</span>
                  <button
                    type="button"
                    className="reader__overlay-close"
                    onClick={closeOverlay}
                    aria-label="Fermer les r\u00E9glages"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L10.59 13.4 4.3 19.71 2.88 18.3 9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3z"/></svg>
                  </button>
                </header>
                  <p id={overlayDescId} className="sr-only">Double tapez ou appuyez sur \u00C9chap pour fermer la palette.</p>
              <div className="reader__overlay-controls reader__ui-row" data-row="1" data-overlay-swipe-lock="true">
                <div className="reader__overlay-controls-left">
                  <button className="reader__back" onClick={() => { window.location.hash = '#/' }}>Retour</button>
                  <button className="reader__fullscreen" type="button" onClick={toggleFullscreen} aria-label="Basculer plein écran">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 5H5v4h2V7h2V5H7zm10 0h-2v2h2v2h2V5h-2zm-2 12v2h2v-2h2v-2h-2v2h-2zm-8 0H5v2h4v-2H7v-2H5v2z"/></svg>
                  </button>
                  <button
                    type="button"
                    className={`reader__bookmark ${bookmarked ? 'is-on' : ''} ${bookmarkPulse ? 'has-pulse' : ''}`}
                    aria-pressed={bookmarked}
                    aria-label={bookmarked ? 'Supprimer le signet courant' : 'Ajouter cette page aux signets'}
                    onClick={toggleBookmarkCurrent}
                  >
                    <svg className="reader__bookmark-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z" />
                    </svg>
                  </button>
                </div>
                <div className="reader__overlay-controls-right">
                  <div className={`reader__text-pill ${textControlsAllActive ? 'is-boost' : ''}`}>
                    <button
                      type="button"
                      className={`reader__segment ${isBoldActive ? 'is-active' : ''}`}
                      aria-pressed={isBoldActive}
                      onClick={() => setBoldBody(v => !v)}
                    >B</button>
                    <div className="reader__segment-sep" aria-hidden="true" />
                    <button
                      type="button"
                      className={`reader__segment ${isScaleActive ? 'is-active' : ''}`}
                      aria-pressed={isScaleActive}
                      onClick={() => setFontDelta(isScaleActive ? 0 : 2)}
                    >A+</button>
                    <div className="reader__segment-sep" aria-hidden="true" />
                    <button
                      type="button"
                      className={`reader__segment ${isAltFontActive ? 'is-active' : ''}`}
                      aria-pressed={isAltFontActive}
                      onClick={() => setFontFamily(f => (f === 'garamond' ? 'playfair' : 'garamond'))}
                    >Aa</button>
                  </div>
                  <button
                    type="button"
                    className="reader__theme-toggle"
                    aria-pressed={theme === 'dark'}
                    aria-label={theme === 'light' ? 'Activer le mode nuit' : 'Activer le mode jour'}
                    onClick={() => setTheme(current => (current === 'light' ? 'dark' : 'light'))}
                  >
                    <img
                      src={theme === 'light' ? '/mode-jour.svg' : '/mode-nuit.svg'}
                      alt=""
                      aria-hidden="true"
                      draggable="false"
                    />
                  </button>
                </div>
              </div>
                </div>
                <div className="reader__overlay-bottom">
              {!showCarousel && (
                <div className="reader__potards reader__ui-row" data-row="2" role="group" aria-label="Réglages audio" data-overlay-swipe-lock="true">
                  <VolumeKnob
                    label="Ambiance"
                    value={musicVolume}
                    onChange={(v) => setMusicVolume(clamp01(v))}
                    onToggleMute={toggleMusicMute}
                  />
                  <VolumeKnob
                    label="Dialogues"
                    value={voiceVolume}
                    onChange={(v) => setVoiceVolume(clamp01(v))}
                    onToggleMute={toggleVoiceMute}
                  />
                </div>
              )}
              {showCarousel && (
                <div className={`reader__carousel-shell reader__ui-row ${carouselNav.prev ? 'has-prev' : ''} ${carouselNav.next ? 'has-next' : ''}`} data-row="2" data-overlay-swipe-lock="true">
                  <button
                    type="button"
                    className="reader__carousel-nav reader__carousel-nav--prev"
                    onClick={() => scrollCarousel('prev')}
                    disabled={!carouselNav.prev}
                    aria-hidden={!carouselNav.prev}
                    aria-label="Faire défiler vers la gauche"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                  </button>
                  <div className="reader__carousel" ref={carouselRef} role="list" aria-live="polite">
                    {carouselItems.length === 0 ? (
                      <div className="reader__carousel-empty">
                        {overlayTab === 'bookmark' ? 'Aucun signet sauvegard\u00E9.' : 'Contenu en cours de chargement.'}
                      </div>
                    ) : (
                      carouselItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="reader__thumb"
                          role="listitem"
                          onClick={() => handleCarouselItemClick(item)}
                          aria-label={item.kind === 'chapter'
                            ? `Aller \u00E0 la page ${item.badge}`
                            : `Restaurer le signet page ${item.badge}`}
                        >
                          <div className="reader__thumb-img" aria-hidden="true">
                            <span className="reader__thumb-badge">{item.badge}</span>
                          </div>
                          <div className="reader__thumb-body">
                            <p className="reader__thumb-title">{item.title}</p>
                            {item.snippet && <p className="reader__thumb-snippet">{item.snippet}</p>}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    className="reader__carousel-nav reader__carousel-nav--next"
                    onClick={() => scrollCarousel('next')}
                    disabled={!carouselNav.next}
                    aria-hidden={!carouselNav.next}
                    aria-label="Faire défiler vers la droite"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="m10 6 1.41 1.41L8.83 10H18v2H8.83l2.58 2.59L10 16l-6-6z"/></svg>
                  </button>
                </div>
              )}
              <div className="reader__dock reader__ui-row" data-row="3" role="group" aria-label="Navigation secondaire" data-overlay-swipe-lock="true">
                <button
                  type="button"
                  className={`reader__dock-circle ${isFirstPage ? 'is-disabled' : ''}`}
                  aria-label={isFirstPage ? 'Première page' : `Page précédente (${Math.max(1, pageIndex)})`}
                  aria-disabled={isFirstPage}
                  onClick={() => {
                    if (isFirstPage) return
                    setNavDir('prev')
                    setPageIndex(i => Math.max(0, i - 1))
                  }}
                >
                  <span>{prevPageLabel}</span>
                </button>
                <button
                  type="button"
                  className={`reader__dock-pill ${(overlayOpen && overlayTab==='bookmark') ? 'is-active' : ''}`}
                  aria-pressed={overlayOpen && overlayTab === 'bookmark'}
                  onClick={() => activateOverlayTab('bookmark')}
                >
                  MARQUE-PAGE
                </button>
                <button
                  type="button"
                  className="reader__dock-pill reader__dock-pill--icon"
                  onClick={() => { window.location.hash = '#/' }}
                  aria-label="Retour au hub"
                >
                  <img src={homeLogoSrc} alt="" aria-hidden="true" draggable="false" />
                </button>
                <button
                  type="button"
                  className={`reader__dock-pill ${(overlayOpen && overlayTab==='chapters') ? 'is-active' : ''}`}
                  aria-pressed={overlayOpen && overlayTab === 'chapters'}
                  onClick={() => activateOverlayTab('chapters')}
                >
                  CHAPITRAGE
                </button>
                <button
                  type="button"
                  className={`reader__dock-circle reader__dock-circle--next ${isLastPage ? 'is-star' : ''} ${(!isLastPage && !hasPages ? 'is-disabled' : '')}`}
                  aria-label={isLastPage ? 'Noter ce chapitre' : `Page suivante (${Math.min(pageCount || 1, pageIndex + 2)})`}
                  aria-disabled={!hasPages}
                  onClick={() => {
                    if (!hasPages) return
                    if (isLastPage) {
                      window.location.hash = '#/rating'
                      return
                    }
                    setNavDir('next')
                    setPageIndex(i => Math.min((pageCount || 1) - 1, i + 1))
                  }}
                >
                  {isLastPage ? (
                    <svg className="reader__dock-star" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="m12 2 2.83 6.57 7.17.61-5.45 4.79 1.63 7.03L12 17.74 5.82 20.99l1.63-7.02L2 9.18l7.17-.61z" />
                    </svg>
                  ) : (
                    <span>{nextPageLabel}</span>
                  )}
                </button>
              </div>
              {overlayTab === 'bookmark' && (
                <div className="reader__panel-actions reader__ui-row" data-row="4" data-overlay-swipe-lock="true">
                  <button
                    type="button"
                    className={`reader__pill ${bookmarked ? 'is-active' : ''}`}
                    onClick={toggleBookmarkCurrent}
                    aria-label={bookmarked ? 'Retirer le marque-page courant' : 'Ajouter un marque-page sur cette page'}
                  >{bookmarked ? 'Retirer le courant' : 'Ajouter la page courante'}</button>
                  {bookmarks.length > 0 && (
                    <button
                      type="button"
                      className="reader__pill"
                      onClick={() => { if (confirm('Supprimer tous les marque-pages de ce chapitre ?')) clearAllBookmarks() }}
                    >Tout effacer</button>
                  )}
                </div>
              )}
                </div>
            </div>
          </div>
          )}
        </>
      )}
      {!showSplash && paywall && (
        <div className="reader__stage" style={{ display: 'grid', placeItems: 'center' }}>
          <div className="reader__paywall" style={{ textAlign: 'center' }}>
            <h2>Chapitre verrouill\u00E9</h2>
            <p>Ce chapitre n\u00E9cessite l'achat du livre.</p>
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

















