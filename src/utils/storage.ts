type V = string | null
export const safeStorage = {
  getLocal(key: string): V { try { return localStorage.getItem(key) } catch { return null } },
  setLocal(key: string, val: string) { try { localStorage.setItem(key, val) } catch {} },
  removeLocal(key: string) { try { localStorage.removeItem(key) } catch {} },
  getSession(key: string): V { try { return sessionStorage.getItem(key) } catch { return null } },
  setSession(key: string, val: string) { try { sessionStorage.setItem(key, val) } catch {} },
  removeSession(key: string) { try { sessionStorage.removeItem(key) } catch {} },
}
