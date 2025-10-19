export function detectInApp(ua?: string): boolean {
  try {
    const v = (ua || navigator.userAgent || (navigator as any).vendor || (window as any).opera || '').toString()
    return /FBAN|FBAV|Instagram|Messenger|Line\/|; wv\)|FB_IAB/i.test(v)
  } catch {
    return false
  }
}
