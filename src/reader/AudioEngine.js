export function createAudioEngine() {
  let ctx = null
  let master = null, music = null, sfx = null, voice = null
  let desiredMusic = 0.8
  let bufferCache = new Map()
  // music cue handling
  let currentMusicSrc = null
  let currentMusicSource = null
  let currentMusicSourceGain = null
  let currentMusicEl = null

  const ensureContext = async () => {
    console.log('ensureContext appelé, ctx actuel:', ctx?.state)
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        console.log('Nouveau AudioContext créé, état:', ctx.state)
        
        master = ctx.createGain()
        music = ctx.createGain()
        sfx = ctx.createGain()
        voice = ctx.createGain()
        
        music.gain.value = desiredMusic
        sfx.gain.value = 1
        voice.gain.value = 1
        master.gain.value = 1
        
        music.connect(master)
        sfx.connect(master)
        voice.connect(master)
        master.connect(ctx.destination)
        
        console.log('Chaîne audio configurée')
      } catch (err) {
        console.error('Erreur création AudioContext:', err)
        throw err
      }
    }
    
    if (ctx.state === 'suspended') {
      console.log('AudioContext suspendu, tentative de reprise...')
      try { 
        await ctx.resume()
        console.log('AudioContext repris, nouvel état:', ctx.state)
      } catch (err) {
        console.error('Erreur reprise AudioContext:', err)
        throw err
      }
    }
  }

  const fetchBuffer = async (url) => {
    await ensureContext()
    if (bufferCache.has(url)) return bufferCache.get(url)
    const res = await fetch(url)
    const arr = await res.arrayBuffer()
    const buf = await ctx.decodeAudioData(arr)
    bufferCache.set(url, buf)
    return buf
  }

  const setCue = async (src, { fadeMs = 220, loop = true } = {}) => {
    if (!src) return
    await ensureContext()
    if (currentMusicSrc === src && currentMusicSource) return
    try {
      const buf = await fetchBuffer(src)
      // new source
      const source = ctx.createBufferSource()
      source.buffer = buf
      source.loop = !!loop
      const gain = ctx.createGain()
      gain.gain.value = 0
      source.connect(gain)
      gain.connect(music)
      const now = ctx.currentTime
      // fade in new source
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(1, now + fadeMs / 1000)
      source.start()
      // fade out old source if exists
      if (currentMusicSource && currentMusicSourceGain) {
        currentMusicSourceGain.gain.cancelScheduledValues(now)
        currentMusicSourceGain.gain.setValueAtTime(currentMusicSourceGain.gain.value, now)
        currentMusicSourceGain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000)
        try { currentMusicSource.stop(now + fadeMs / 1000 + 0.02) } catch {}
      }
      if (currentMusicEl) {
        try { currentMusicEl.pause(); currentMusicEl.src = '' } catch {}
        currentMusicEl = null
      }
      currentMusicSource = source
      currentMusicSourceGain = gain
      currentMusicSrc = src
    } catch (e) {
      console.warn('AudioEngine setCue failed, fallback to HTMLAudio', e)
      try {
        // fallback element
        const el = new Audio(src)
        el.loop = !!loop
        el.volume = Math.max(0, Math.min(1, desiredMusic))
        await el.play()
        if (currentMusicEl) { try { currentMusicEl.pause(); currentMusicEl.src = '' } catch {} }
        currentMusicEl = el
        // stop WebAudio source if any
        if (currentMusicSource) { try { currentMusicSource.stop() } catch {} }
        currentMusicSource = null
        currentMusicSourceGain = null
        currentMusicSrc = src
      } catch (e2) {
        console.warn('AudioEngine HTMLAudio cue failed', e2)
      }
    }
  }

  const playSfx = async (src) => {
    if (!src) return
    await ensureContext()
    try {
      const buf = await fetchBuffer(src)
      const node = ctx.createBufferSource()
      node.buffer = buf
      node.connect(sfx)
      node.start()
    } catch (e) {
      console.warn('AudioEngine playSfx failed, fallback to HTMLAudio', e)
      try { const el = new Audio(src); await el.play() } catch (e2) { console.warn('HTMLAudio SFX failed', e2) }
    }
  }

  const playVoice = async (src, { duckDb = 0.5, releaseMs = 480 } = {}) => {
    console.log('=== AudioEngine playVoice ===')
    console.log('src:', src)
    console.log('ctx état avant:', ctx?.state)
    
    if (!src) {
      console.warn('Pas de src fourni')
      return
    }
    
    await ensureContext()
    console.log('ctx état après ensureContext:', ctx?.state)
    
    // Si c'est un son de test, créer un bip synthétisé
    if (src === 'test-beep' || src.includes('test-beep')) {
      console.log('=== Génération bip de test ===')
      try {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(voice)
        
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        
        const now = ctx.currentTime
        gainNode.gain.setValueAtTime(0.3, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
        
        oscillator.start(now)
        oscillator.stop(now + 0.5)
        
        console.log('Bip de test programmé et démarré')
        
        // Attendre que le son se termine
        return new Promise(resolve => {
          setTimeout(() => {
            console.log('Bip de test terminé')
            resolve()
          }, 600)
        })
      } catch (e) {
        console.error('Échec du bip de test:', e)
        throw e
      }
    }
    
    // Pour les vrais fichiers audio
    try {
      console.log('Tentative de chargement du fichier audio:', src)
      const buf = await fetchBuffer(src)
      console.log('Buffer audio chargé, durée:', buf.duration)
      
      const node = ctx.createBufferSource()
      node.buffer = buf
      node.connect(voice)
      
      // Réduction du volume de la musique de fond
      const now = ctx.currentTime
      const orig = desiredMusic
      if (music && music.gain) {
        music.gain.cancelScheduledValues(now)
        music.gain.setTargetAtTime(orig * duckDb, now, 0.05)
        console.log('Musique réduite pour dialogue')
      }
      
      node.start(now)
      console.log('Audio de voix démarré')
      
      node.addEventListener('ended', () => {
        const t = ctx.currentTime
        if (music && music.gain) {
          music.gain.cancelScheduledValues(t)
          music.gain.setTargetAtTime(orig, t, Math.max(0.05, releaseMs / 1000))
          console.log('Musique restaurée après dialogue')
        }
      }, { once: true })
      
      // Retourner une promesse qui se résout quand l'audio se termine
      return new Promise(resolve => {
        node.addEventListener('ended', resolve, { once: true })
      })
      
    } catch (e) {
      console.warn('AudioEngine playVoice échoué, tentative HTMLAudio:', e)
      try { 
        const el = new Audio(src)
        el.volume = 0.8
        console.log('HTMLAudio créé, tentative de lecture...')
        await el.play()
        console.log('HTMLAudio en cours de lecture')
        return new Promise(resolve => {
          el.addEventListener('ended', resolve, { once: true })
        })
      } catch (e2) { 
        console.error('HTMLAudio échoué aussi:', e2)
        // Dernier recours : bip synthétisé
        console.log('=== Bip de secours ===')
        try {
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(voice)
          
          oscillator.frequency.value = 600
          oscillator.type = 'triangle'
          
          const now = ctx.currentTime
          gainNode.gain.setValueAtTime(0.2, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
          
          oscillator.start(now)
          oscillator.stop(now + 0.3)
          
          console.log('Bip de secours programmé')
          
          return new Promise(resolve => {
            setTimeout(resolve, 400)
          })
        } catch (e3) {
          console.error('Tous les méthodes de lecture audio ont échoué:', e3)
          throw e3
        }
      }
    }
  }

  return {
    async ensureStarted() { 
      await ensureContext()
      console.log('Engine démarré, état final:', ctx?.state)
    },
    async setCue(src, opts) { await setCue(src, opts) },
    async playSfx(src) { await playSfx(src) },
    async playVoice(src, opts) { await playVoice(src, opts) },
    setMusicVolume(v) { desiredMusic = Math.max(0, Math.min(1, v)); if (music) music.gain.value = desiredMusic },
    setVoiceVolume(v) { if (voice) voice.gain.value = Math.max(0, Math.min(1, v)) },
    get state() { return ctx?.state || 'idle' },
    get nodes() { return { ctx, master, music, sfx, voice } }
  }
}
