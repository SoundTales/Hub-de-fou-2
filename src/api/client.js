// Mock API client pour développement

export async function getChapterAst(taleId, chapterId, options = {}) {
  // Simuler une erreur pour forcer le fallback vers le contenu mock
  throw new Error('Mock API - utilisera le contenu de test')
}

export async function getEntitlements() {
  // Mock entitlements - tout débloqué pour le dev
  return {
    chapters: {
      'tale1:1': true,
      'tale1:2': true,
      'tale1:3': true
    },
    tales: {
      'tale1': true
    }
  }
}

export async function createCheckoutSession({ chapterId, taleId }) {
  // Mock checkout - redirect vers une page de test
  console.warn('Mock checkout session pour', { chapterId, taleId })
  return 'https://example.com/mock-checkout'
}
