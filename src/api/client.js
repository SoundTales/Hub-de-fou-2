// Mock API client pour développement

// Petit délai simulé pour homogénéiser les temps de chargement
const delay = (base = 220, jitter = 160) => new Promise(r => setTimeout(r, base + Math.floor(Math.random() * jitter)))

export async function getChapterAst(taleId, chapterId, options = {}) {
  // Simuler une erreur pour forcer le fallback vers le contenu mock
  await delay()
  throw new Error('Mock API - utilisera le contenu de test')
}

export async function getEntitlements() {
  // Mock entitlements – partiel pour démonstration des chapitres verrouillés
  // - tale1: seuls les chapitres 1 et 2 sont déverrouillés
  // - tale2: seul le chapitre 1 est déverrouillé
  await delay()
  return {
    chapters: {
      'tale1:1': true,
      'tale1:2': true,
      'tale2:1': true
    },
    tales: {
      // pas de déverrouillage global, pour laisser s'afficher les 🔒
    }
  }
}

export async function createCheckoutSession({ chapterId, taleId }) {
  // Mock checkout - redirect vers une page de test
  await delay(180, 120)
  console.warn('Mock checkout session pour', { chapterId, taleId })
  return 'https://example.com/mock-checkout'
}

export async function getTales(options = {}) {
  // Essaie une API, puis JSON mock, puis inline
  await delay()
  const withBase = (p) => {
    try {
      const b = options?.baseUrl || (import.meta?.env?.BASE_URL || '/')
      return `${b.endsWith('/') ? b : b + '/'}${p.replace(/^\/?/, '')}`
    } catch { return p }
  }
  const tryFetchMany = async (urls) => {
    for (const url of urls) {
      try {
        const res = await fetch(url)
        if (!res.ok) continue
        return await res.json()
      } catch {}
    }
    throw new Error('Tales not found')
  }
  try {
    const res = await fetch('/api/tales', { credentials: 'include' })
    if (res.ok) return await res.json()
  } catch {}
  try {
    return await tryFetchMany([
      withBase('mock/tales.json'),
      '/mock/tales.json',
      'mock/tales.json'
    ])
  } catch {}
  // Inline minimal (fallback ultime)
  const chapters = Array.from({ length: 12 }, (_, i) => ({ 
    id: String(i + 1), 
    title: `Chapitre ${i + 1}`,
    cover: `https://picsum.photos/800/450?random=${100 + i}`
  }))
  return {
    tales: [
      {
        id: 'tale1',
        title: 'OSRASE',
        cover: 'https://picsum.photos/800/450?random=101',
        chapters
      },
      {
        id: 'tale2',
        title: 'NEBULA',
        cover: 'https://picsum.photos/800/450?random=202',
        chapters: Array.from({ length: 8 }, (_, i) => ({ 
          id: String(i + 1), 
          title: `Chapitre ${i + 1}`,
          cover: `https://picsum.photos/800/450?random=${200 + i}`
        }))
      }
    ]
  }
}

export async function getSignedAudioUrl({ type = 'voice', resource, taleId, chapterId }) {
  if (!resource) return null
  const query = new URLSearchParams({
    type,
    resource,
    taleId: taleId || '',
    chapterId: chapterId || ''
  })
  try {
    const res = await fetch(`/api/audio/sign?${query.toString()}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json().catch(() => null)
      if (data?.url) return data.url
    }
  } catch {}
  return null
}
