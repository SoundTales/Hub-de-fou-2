/**
 * Système de persistance centralisé avec namespace st:*
 * Conforme à la spécification OSRASE Bible v1.0 § 9
 */

const NS = 'st:'

type SafeStorage = 'local' | 'session'

function getStorage(type: SafeStorage): Storage | null {
  try {
    const storage = type === 'local' ? localStorage : sessionStorage
    const test = '__storage_test__'
    storage.setItem(test, test)
    storage.removeItem(test)
    return storage
  } catch {
    return null
  }
}

function safeGet(type: SafeStorage, key: string): string | null {
  try {
    return getStorage(type)?.getItem(`${NS}${key}`) ?? null
  } catch {
    return null
  }
}

function safeSet(type: SafeStorage, key: string, value: string): boolean {
  try {
    getStorage(type)?.setItem(`${NS}${key}`, value)
    return true
  } catch {
    return false
  }
}

function safeRemove(type: SafeStorage, key: string): boolean {
  try {
    getStorage(type)?.removeItem(`${NS}${key}`)
    return true
  } catch {
    return false
  }
}

// === Préférences globales ===
export interface ReaderPrefs {
  theme?: 'light' | 'dark'
  fontFamily?: 'playfair' | 'garamond'
  fontDelta?: number
  boldBody?: boolean
  musicVolume?: number
  voiceVolume?: number
}

export function getReaderPrefs(): ReaderPrefs {
  const raw = safeGet('local', 'reader:prefs')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function setReaderPrefs(prefs: ReaderPrefs): void {
  try {
    safeSet('local', 'reader:prefs', JSON.stringify(prefs))
  } catch {}
}

// === Progression (par tale) ===
export interface ReadProgress {
  chapterId: string
  pageIndex: number
  ts: number
}

export function getProgress(taleId: string): ReadProgress | null {
  const raw = safeGet('local', `progress:${taleId}`)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setProgress(taleId: string, progress: ReadProgress): void {
  try {
    safeSet('local', `progress:${taleId}`, JSON.stringify(progress))
  } catch {}
}

// === Signets (par tale + chapitre) ===
export interface Bookmark {
  id: string
  chapterId: string
  pageIndex: number
  ts: number
  dialogues: string[]
  theme?: 'light' | 'dark'
  fontFamily?: string
  fontDelta?: number
  boldBody?: boolean
  music?: number
  voice?: number
  triggers?: string[]
  audio?: any
}

export function getBookmarks(taleId: string, chapterId: string): Bookmark[] {
  const raw = safeGet('local', `bookmarks:${taleId}:${chapterId}`)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setBookmarks(taleId: string, chapterId: string, bookmarks: Bookmark[]): void {
  try {
    safeSet('local', `bookmarks:${taleId}:${chapterId}`, JSON.stringify(bookmarks))
  } catch {}
}

// === Dialogues lus (par tale + chapitre) ===
export function getReadDialogues(taleId: string, chapterId: string): Set<string> {
  const raw = safeGet('local', `dialogues:${taleId}:${chapterId}`)
  if (!raw) return new Set()
  try {
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

export function setReadDialogues(taleId: string, chapterId: string, ids: Set<string>): void {
  try {
    safeSet('local', `dialogues:${taleId}:${chapterId}`, JSON.stringify(Array.from(ids)))
  } catch {}
}

// === Triggers déclenchés (par tale + chapitre) ===
export function getFiredTriggers(taleId: string, chapterId: string): Set<string> {
  const raw = safeGet('local', `triggers:${taleId}:${chapterId}`)
  if (!raw) return new Set()
  try {
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

export function setFiredTriggers(taleId: string, chapterId: string, ids: Set<string>): void {
  try {
    safeSet('local', `triggers:${taleId}:${chapterId}`, JSON.stringify(Array.from(ids)))
  } catch {}
}

// === Favoris hub (par tale + chapitre) ===
export function isFavorite(taleId: string, chapterId: string): boolean {
  return safeGet('local', `fav:${taleId}:${chapterId}`) === '1'
}

export function setFavorite(taleId: string, chapterId: string, value: boolean): void {
  if (value) {
    safeSet('local', `fav:${taleId}:${chapterId}`, '1')
  } else {
    safeRemove('local', `fav:${taleId}:${chapterId}`)
  }
}

// === Session (éphémère) ===
export function getSessionFlag(key: string): boolean {
  return safeGet('session', key) === '1'
}

export function setSessionFlag(key: string, value: boolean): void {
  if (value) {
    safeSet('session', key, '1')
  } else {
    safeRemove('session', key)
  }
}

export function getSessionData<T>(key: string): T | null {
  const raw = safeGet('session', key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSessionData<T>(key: string, data: T): void {
  try {
    safeSet('session', key, JSON.stringify(data))
  } catch {}
}

export function removeSessionData(key: string): void {
  safeRemove('session', key)
}

// === Migration depuis anciennes clés ===
export function migrateOldKeys(): void {
  try {
    const local = getStorage('local')
    const session = getStorage('session')
    if (!local || !session) return

    // Mapping anciennes → nouvelles clés
    const migrations: Array<[string, string, SafeStorage]> = [
      ['reader:prefs', 'reader:prefs', 'local'],
      ['reader:progress:tale1', 'progress:tale1', 'local'],
      ['reader:bookmarks:tale1:', 'bookmarks:tale1:', 'local'], // préfixe
      ['hub:fav:tale1:', 'fav:tale1:', 'local'], // préfixe
      ['hub:gateDismissed', 'gate:dismissed', 'session'],
      ['audioPrimed', 'audio:primed', 'session'],
      ['reader:splashSeen:', 'splash:seen:', 'session'], // préfixe
      ['reader:splash', 'splash:data', 'session'],
      ['reader:resume', 'resume:data', 'session'],
      ['iab:firstActionDone', 'iab:first-action', 'local'],
      ['hub:fs', 'fs:active', 'session'],
      ['hub:pseudoFS', 'fs:pseudo', 'session']
    ]

    for (const [oldKey, newKey, storageType] of migrations) {
      const storage = storageType === 'local' ? local : session
      
      // Cas préfixe (ex: bookmarks:tale1:*)
      if (oldKey.endsWith(':')) {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          if (key?.startsWith(oldKey)) {
            const suffix = key.slice(oldKey.length)
            const value = storage.getItem(key)
            if (value !== null) {
              safeSet(storageType, `${newKey}${suffix}`, value)
              storage.removeItem(key)
            }
          }
        }
      } else {
        // Clé simple
        const value = storage.getItem(oldKey)
        if (value !== null) {
          safeSet(storageType, newKey, value)
          storage.removeItem(oldKey)
        }
      }
    }
  } catch {}
}
