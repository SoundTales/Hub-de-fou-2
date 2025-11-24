import { useEffect, useState } from 'react'
import { useChapter } from './useChapter.js'

export default function ReaderShell({ chapterId, baseUrl }) {
  const taleId = 'tale1'
  const [pageIndex, setPageIndex] = useState(0)
  const { loading, error, ast, pages } = useChapter({ taleId, chapterId, baseUrl })

  useEffect(() => {
    setPageIndex(0)
  }, [chapterId])

  const pageCount = pages?.length ?? 0
  const safeIndex = pageCount ? Math.min(pageIndex, pageCount - 1) : 0
  const currentPage = pageCount ? pages[safeIndex] : null
  const payload = currentPage ?? ast ?? null

  return (
    <div className="reader reader--bare" data-theme="raw">
      {loading && <p className="reader__status">Chargement du chapitre…</p>}
      {error && (
        <pre className="reader__json reader__json--error" aria-live="assertive">
          {error?.message || String(error)}
        </pre>
      )}
      {!loading && !error && !payload && (
        <p className="reader__status">Aucune donnée disponible pour ce chapitre.</p>
      )}
      {payload && (
        <pre className="reader__json" aria-live="polite">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
      {pageCount > 0 && (
        <div className="reader__nav" role="group" aria-label="Navigation des pages">
          <button
            type="button"
            onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
            disabled={safeIndex === 0}
          >
            Page précédente
          </button>
          <span className="reader__nav-counter">Page {safeIndex + 1} / {pageCount}</span>
          <button
            type="button"
            onClick={() => setPageIndex((index) => Math.min(pageCount - 1, index + 1))}
            disabled={safeIndex >= pageCount - 1}
          >
            Page suivante
          </button>
        </div>
      )}
    </div>
  )
}
