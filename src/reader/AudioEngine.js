/**
 * Résout le chemin source d'un cue (boucle d'ambiance)
 * @param {string} src - Chemin relatif ou absolu
 * @returns {string} URL complète
 */
function resolveCueSource(src) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;
  return `/assets/audio/cues/${src}`;
}

/**
 * Résout le chemin source d'un dialogue (voix)
 * @param {string} src - Chemin relatif ou absolu
 * @returns {string} URL complète
 */
function resolveVoiceSource(src) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;
  return `/assets/audio/voices/${src}`;
}

/**
 * Résout le chemin source d'un SFX
 * @param {string} src - Chemin relatif ou absolu
 * @returns {string} URL complète
 */
function resolveSfxSource(src) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;
  return `/assets/audio/sfx/${src}`;
}

export function createAudioEngine() {
  let ctx = null
  let master = null, music = null, sfx = null, voice = null
  let desiredMusic = 0.8
  const voicePlayback = {
    node: null,
    buffer: null,
    html: null,
    htmlHandler: null,
    src: null,
    status: 'idle',
    offset: 0,
    startedAt: 0,
    resolve: null,
    handleEnded: null,
    meta: null,
    duck: { amount: 0.5, release: 480 }
  }
  const bufferCache = new Map()
  const lru = []
  const MAX_BUFFERS = 16
  const METRIC_WINDOW = 100
  const duckMusic = (duckDb = 0.5) => {
    if (!music || !ctx) return
    const now = ctx.currentTime
    music.gain.cancelScheduledValues(now)
    music.gain.setTargetAtTime(Math.max(0, Math.min(1, desiredMusic * duckDb)), now, 0.05)
  }
  const restoreMusic = (releaseMs = 480) => {
    if (!music || !ctx) return
    const now = ctx.currentTime
    music.gain.cancelScheduledValues(now)
    music.gain.setTargetAtTime(Math.max(0, desiredMusic), now, Math.max(0.05, releaseMs / 1000))
  }
  const clearVoiceNode = () => {
    if (voicePlayback.node) {
      if (voicePlayback.handleEnded) voicePlayback.node.removeEventListener('ended', voicePlayback.handleEnded)
      try { voicePlayback.node.stop() } catch {}
    }
    voicePlayback.node = null
    voicePlayback.handleEnded = null
  }
  const clearHtmlVoice = () => {
    if (voicePlayback.html) {
      if (voicePlayback.htmlHandler) voicePlayback.html.removeEventListener('ended', voicePlayback.htmlHandler)
      try { voicePlayback.html.pause?.() } catch {}
    }
    voicePlayback.html = null
    voicePlayback.htmlHandler = null
  }
  const resetVoiceState = (resolvePromise = true) => {
    clearVoiceNode()
    clearHtmlVoice()
    if (resolvePromise && voicePlayback.resolve) {
      try { voicePlayback.resolve() } catch {}
    }
    voicePlayback.resolve = null
    voicePlayback.buffer = null
    voicePlayback.src = null
    voicePlayback.status = 'idle'
    voicePlayback.offset = 0
    voicePlayback.startedAt = 0
    voicePlayback.meta = null
    voicePlayback.duck = { amount: 0.5, release: 480 }
  }
  const finishVoicePlayback = () => {
    restoreMusic(voicePlayback.duck.release)
    resetVoiceState(true)
  }
  const metrics = {
    fetchMs: { cue: [], sfx: [], voice: [], prefetch: [] },
    decodeMs: { cue: [], sfx: [], voice: [], prefetch: [] },
    htmlStartMs: { cue: [], sfx: [], voice: [], prefetch: [] },
  }
  const pushMetric = (bucket, category, ms) => {
    try {
      const arr = (metrics[bucket] && metrics[bucket][category])
      if (!arr) return
      arr.push(ms)
      if (arr.length > METRIC_WINDOW) arr.splice(0, arr.length - METRIC_WINDOW)
      // periodic log
      if (arr.length % 10 === 0) {
        const sorted = [...arr].sort((a,b)=>a-b)
        const p95 = sorted[Math.max(0, Math.min(sorted.length - 1, Math.floor(sorted.length*0.95)))]
        console.log(`[Audio][p95] ${bucket}/${category}: ${Math.round(p95)}ms (n=${arr.length})`)
      }
    } catch {}
  }

  const ensureContext = async () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      master = ctx.createGain()
      music = ctx.createGain()
      sfx = ctx.createGain()
      voice = ctx.createGain()
      music.gain.value = desiredMusic
      sfx.gain.value = 1
      voice.gain.value = 1
      music.connect(master)
      sfx.connect(master)
      voice.connect(master)
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') {
      try { await ctx.resume() } catch {}
    }
  }

  const fetchBuffer = async (url, { category = 'prefetch' } = {}) => {
    await ensureContext()
    if (bufferCache.has(url)) return bufferCache.get(url)
    const t0 = performance.now()
    const res = await fetch(url, { mode: 'cors' })
    const arr = await res.arrayBuffer()
    const t1 = performance.now()
    const buf = await ctx.decodeAudioData(arr)
    const t2 = performance.now()
    pushMetric('fetchMs', category, t1 - t0)
    pushMetric('decodeMs', category, t2 - t1)
    bufferCache.set(url, buf)
    lru.push(url)
    if (lru.length > MAX_BUFFERS) {
      const old = lru.shift()
      if (old && old !== url) bufferCache.delete(old)
    }
    return buf
  }

  // Music cue crossfade
  let currentMusicSrc = null
  let currentMusicSource = null
  let currentMusicGain = null
  let currentMusicEl = null

  // Lightweight oscillator beep (no network)
  const playBeep = async (targetNode = sfx, { ms = 180, freq = 880, gain = 0.2 } = {}) => {
    await ensureContext()
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.frequency.value = freq
    g.gain.value = 0
    osc.connect(g)
    g.connect(targetNode)
    const now = ctx.currentTime
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(gain, now + 0.01)
    g.gain.linearRampToValueAtTime(0.0001, now + ms / 1000)
    osc.start(now)
    osc.stop(now + ms / 1000 + 0.02)
    return new Promise(res => osc.addEventListener('ended', () => res(), { once: true }))
  }

  const setCue = async (src, { fadeMs = 220, loop = true } = {}) => {
    if (!src) return
    await ensureContext()
    if (currentMusicSrc === src && (currentMusicSource || currentMusicEl)) return
    // If context is not allowed yet, fallback HTMLAudio immediately
    if (ctx.state !== 'running') {
      try {
        const el = new Audio(src)
        try { el.crossOrigin = 'anonymous' } catch {}
        el.loop = !!loop
        el.volume = Math.max(0, Math.min(1, desiredMusic))
        const t0 = performance.now()
        await el.play()
        pushMetric('htmlStartMs', 'cue', performance.now() - t0)
        if (currentMusicEl) { try { currentMusicEl.pause(); currentMusicEl.src = '' } catch {} }
        currentMusicEl = el
        if (currentMusicSource) { try { currentMusicSource.stop() } catch {} }
        currentMusicSource = null
        currentMusicGain = null
        currentMusicSrc = src
        return
      } catch {}
    }
    try {
      const buf = await fetchBuffer(src, { category: 'cue' })
      const source = ctx.createBufferSource()
      source.buffer = buf
      source.loop = !!loop
      const gain = ctx.createGain(); gain.gain.value = 0
      source.connect(gain); gain.connect(music)
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(1, now + fadeMs / 1000)
      source.start()
      if (currentMusicGain && currentMusicSource) {
        currentMusicGain.gain.cancelScheduledValues(now)
        currentMusicGain.gain.setValueAtTime(currentMusicGain.gain.value, now)
        currentMusicGain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000)
        try { currentMusicSource.stop(now + fadeMs / 1000 + 0.02) } catch {}
      }
      if (currentMusicEl) { try { currentMusicEl.pause(); currentMusicEl.src = '' } catch {}; currentMusicEl = null }
      currentMusicSource = source
      currentMusicGain = gain
      currentMusicSrc = src
    } catch (e) {
      // fallback
      try {
        const el = new Audio(src)
        try { el.crossOrigin = 'anonymous' } catch {}
        el.loop = !!loop
        el.volume = Math.max(0, Math.min(1, desiredMusic))
        const t0 = performance.now()
        await el.play()
        pushMetric('htmlStartMs', 'cue', performance.now() - t0)
        if (currentMusicEl) { try { currentMusicEl.pause(); currentMusicEl.src = '' } catch {} }
        currentMusicEl = el
        if (currentMusicSource) { try { currentMusicSource.stop() } catch {} }
        currentMusicSource = null
        currentMusicGain = null
        currentMusicSrc = src
      } catch {}
    }
  }

  const playSfx = async (src) => {
    if (!src) return
    await ensureContext()
    if (src === 'test-beep') { try { await playBeep(sfx) } catch {}; return }
    if (ctx.state !== 'running') {
      try { const el = new Audio(src); try { el.crossOrigin = 'anonymous' } catch {}; const t0 = performance.now(); await el.play(); pushMetric('htmlStartMs','sfx',performance.now()-t0); return } catch {}
    }
    try {
      const buf = await fetchBuffer(src, { category: 'sfx' })
      const node = ctx.createBufferSource(); node.buffer = buf
      node.connect(sfx); node.start()
    } catch (e) {
      try { const el = new Audio(src); try { el.crossOrigin = 'anonymous' } catch {}; const t0 = performance.now(); await el.play(); pushMetric('htmlStartMs','sfx',performance.now()-t0) } catch {}
    }
  }

  const playVoice = async (src, { duckDb = 0.5, releaseMs = 480, metaId = null } = {}) => {
    if (!src) return
    await ensureContext()
    if (voicePlayback.status !== 'idle') restoreMusic(voicePlayback.duck.release)
    resetVoiceState(true)
    voicePlayback.duck = { amount: duckDb, release: releaseMs }
    voicePlayback.meta = metaId || null
    voicePlayback.src = src
    if (src === 'test-beep') {
      try { await playBeep(voice) } catch {}
      return
    }
    const playbackPromise = new Promise(resolve => { voicePlayback.resolve = resolve })
    const startWithBuffer = async () => {
      const buf = await fetchBuffer(src, { category: 'voice' })
      voicePlayback.buffer = buf
      voicePlayback.status = 'playing'
      voicePlayback.offset = 0
      const node = ctx.createBufferSource()
      node.buffer = buf
      voicePlayback.node = node
      const onEnded = () => {
        if (voicePlayback.status !== 'playing') return
        finishVoicePlayback()
      }
      voicePlayback.handleEnded = onEnded
      node.addEventListener('ended', onEnded)
      duckMusic(duckDb)
      node.connect(voice)
      voicePlayback.startedAt = ctx.currentTime
      node.start(0)
      return playbackPromise
    }
    try {
      return await startWithBuffer()
    } catch (err) {
      try {
        const el = new Audio(src)
        try { el.crossOrigin = 'anonymous' } catch {}
        el.loop = false
        voicePlayback.html = el
        voicePlayback.status = 'playing'
        voicePlayback.offset = 0
        voicePlayback.duck = { amount: duckDb, release: releaseMs }
        const handler = () => {
          if (voicePlayback.status !== 'playing') return
          finishVoicePlayback()
        }
        voicePlayback.htmlHandler = handler
        el.addEventListener('ended', handler)
        duckMusic(duckDb)
        await el.play()
        return playbackPromise
      } catch (fallbackErr) {
        resetVoiceState(true)
        throw err
      }
    }
  }

  const pauseVoice = () => {
    if (voicePlayback.status !== 'playing') return false
    if (voicePlayback.node) {
      if (ctx) {
        const elapsed = Math.max(0, ctx.currentTime - voicePlayback.startedAt)
        const duration = voicePlayback.buffer?.duration || 0
        voicePlayback.offset = Math.min(duration, Math.max(0, voicePlayback.offset + elapsed))
      }
      clearVoiceNode()
    } else if (voicePlayback.html) {
      try {
        voicePlayback.offset = voicePlayback.html.currentTime || voicePlayback.offset
        voicePlayback.html.pause()
      } catch {}
    }
    voicePlayback.status = 'paused'
    restoreMusic(voicePlayback.duck.release)
    return true
  }

  const resumeVoice = async () => {
    if (voicePlayback.status !== 'paused') return false
    if (voicePlayback.html) {
      try {
        if (!Number.isNaN(voicePlayback.offset)) voicePlayback.html.currentTime = voicePlayback.offset
        await voicePlayback.html.play()
        voicePlayback.status = 'playing'
        return true
      } catch {
        return false
      }
    }
    if (!voicePlayback.buffer) return false
    await ensureContext()
    const duration = voicePlayback.buffer.duration || 0
    const offset = Math.min(Math.max(0, voicePlayback.offset), Math.max(0, duration - 0.01))
    const node = ctx.createBufferSource()
    node.buffer = voicePlayback.buffer
    voicePlayback.node = node
    voicePlayback.status = 'playing'
    voicePlayback.startedAt = ctx.currentTime
    const onEnded = () => {
      if (voicePlayback.status !== 'playing') return
      finishVoicePlayback()
    }
    voicePlayback.handleEnded = onEnded
    node.addEventListener('ended', onEnded)
    duckMusic(voicePlayback.duck.amount)
    node.connect(voice)
    node.start(0, offset)
    return true
  }

  const getVoiceOffset = () => {
    if (voicePlayback.status === 'playing') {
      if (voicePlayback.node && ctx) {
        const elapsed = Math.max(0, ctx.currentTime - voicePlayback.startedAt)
        return Math.max(0, voicePlayback.offset + elapsed)
      }
      if (voicePlayback.html) {
        try { return voicePlayback.html.currentTime || voicePlayback.offset } catch { return voicePlayback.offset }
      }
    }
    return voicePlayback.offset
  }
  const getSnapshot = () => ({
    state: ctx?.state || 'idle',
    music: currentMusicSrc ? { src: currentMusicSrc, volume: desiredMusic } : null,
    voice: voicePlayback.src ? { src: voicePlayback.src, status: voicePlayback.status, metaId: voicePlayback.meta, offset: getVoiceOffset() } : null,
    timestamp: ctx?.currentTime || 0
  })

  return {
    async ensureStarted() { await ensureContext(); try { sessionStorage.setItem('audioPrimed','1'); sessionStorage.setItem('audioPrimedAt', String(Date.now())) } catch {} },
    async setCue(src, opts) { await setCue(src, opts) },
    async playSfx(src) { await playSfx(src) },
    async playVoice(src, opts) { await playVoice(src, opts) },
    pauseVoice() { return pauseVoice() },
    async resumeVoice() { return await resumeVoice() },
    getVoiceState() { return { status: voicePlayback.status, src: voicePlayback.src, metaId: voicePlayback.meta } },
    setMusicVolume(v) { desiredMusic = Math.max(0, Math.min(1, v)); if (music) music.gain.value = desiredMusic },
    setVoiceVolume(v) { if (voice) voice.gain.value = Math.max(0, Math.min(1, v)) },
    async prefetch(url) { try { await fetchBuffer(url, { category: 'prefetch' }) } catch {} },
    get state() { return ctx?.state || 'idle' },
    get nodes() { return { ctx, master, music, sfx, voice } },
    getSnapshot() { return getSnapshot() }
  }
}
