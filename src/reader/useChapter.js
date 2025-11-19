import { useEffect, useState } from "react";
import { getChapterAst } from "../api/client.js";
import { parseAnnotatedHtmlToAst } from "./ChapterParser.js";
import { chunkBlocksByHeight } from "./Chunker.js";

// Normalise une base sans slash final
function normalizeBase(base) {
  const b = (base ?? '').toString().trim()
  if (!b) return ''
  return b.replace(/\/+$/, '')
}

// Essaye en séquence une liste d’URLs; tolère MIME non-JSON et BOM
async function fetchFirstJson(candidates) {
  let lastErr = null
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: import.meta.env.DEV ? 'no-cache' : 'default' })
      if (!res.ok) { lastErr = new Error(`HTTP ${res.status} ${res.statusText}`); continue }
      const ct = (res.headers.get('content-type') || '').toLowerCase()
      if (ct.includes('json')) {
        return { url, data: await res.json() }
      }
      // Fallback: parse texte -> JSON (gère BOM)
      const text = await res.text()
      const clean = text.replace(/^\uFEFF/, '')
      try {
        const data = JSON.parse(clean)
        return { url, data }
      } catch (e) {
        lastErr = new Error(`MIME ${ct || 'inconnu'}, parse JSON échoué`)
      }
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('Aucun chapitre JSON accessible.')
}

const stripHtml = (value) => {
  if (typeof value !== 'string') return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function deriveBlocksFromPages(pages) {
  if (!Array.isArray(pages)) return []
  const blocks = []
  let autoId = 0
  for (const page of pages) {
    if (!Array.isArray(page?.elements)) continue
    for (const element of page.elements) {
      if (!element) continue
      const prefix = element.type === 'dialogue' ? 'd' : 'p'
      const id = element.id || `${prefix}-${page?.id || 'pg'}-${autoId++}`
      if (element.type === 'text' || element.type === 'para') {
        const text = element.text || stripHtml(element.html)
        if (text) blocks.push({ type: 'para', id, text })
        continue
      }
      if (element.type === 'dialogue') {
        const text = element.text || stripHtml(element.html)
        if (!text) continue
        blocks.push({
          type: 'dialogue',
          id,
          text,
          speaker: element.speaker || 'Narrateur'
        })
      }
    }
  }
  return blocks
}

export function useChapter({ taleId, chapterId, baseUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ast, setAst] = useState(null);
  const [pages, setPages] = useState([]);
  const [resolvedUrl, setResolvedUrl] = useState(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true)
        setError(null)

        const devBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
        const b = normalizeBase(baseUrl)

        // Ordre d’essai:
        // 1) baseUrl/chapter.json (si baseUrl fourni)
        // 2) public: /chapters/<taleId>/<chapterId>/chapter.json
        // 3) public: /chapters/<chapterId>/chapter.json
        // 4) public (racine): /chapter.json
        // 5) fallback mock data: /mock/chapters/...
        const candidates = []
        if (b) candidates.push(`${b}/chapter.json`)
        candidates.push(
          `${devBase}/chapters/${taleId}/${chapterId}/chapter.json`,
          `${devBase}/chapters/${chapterId}/chapter.json`,
          `${devBase}/chapter.json`,
          `${devBase}/mock/chapters/${taleId}/${chapterId}.json`,
          `${devBase}/mock/chapters/${chapterId}.json`,
          `${devBase}/mock/chapter.json`
        )

        if (import.meta.env.DEV) console.info('[useChapter] Essais chapter.json:', candidates)

        const { url, data } = await fetchFirstJson(candidates)
        if (aborted) return
        setResolvedUrl(url)
        if (import.meta.env.DEV) console.info('[useChapter] OK:', url)

        // Tolérance structure: ast direct ou data.ast; pages directes ou data.content.pages
        const fallbackPages = data?.pages ?? data?.content?.pages ?? null
        let nextAst = data?.ast ?? data
        const hasBlocks = Array.isArray(nextAst?.blocks) && nextAst.blocks.length > 0
        if (!hasBlocks) {
          const derivedBlocks = deriveBlocksFromPages(fallbackPages)
          if (derivedBlocks.length) {
            nextAst = { ...(typeof nextAst === 'object' && nextAst !== null ? nextAst : {}), blocks: derivedBlocks }
          }
        }

        setAst(nextAst)
        setPages(fallbackPages)
      } catch (e) {
        if (!aborted) setError(e)
        if (import.meta.env.DEV) {
          console.warn('[useChapter] Échec chargement', {
            taleId, chapterId, baseUrl, error: e?.message || e
          })
        }
      } finally {
        if (!aborted) setLoading(false)
      }
    })()
    return () => { aborted = true }
  }, [taleId, chapterId, baseUrl]);

  // Re-chunk sur resize
  useEffect(() => {
    if (!ast?.blocks?.length) {
      console.log("[useChapter] Pas de blocs à découper");
      setPages([]);
      return;
    }

    console.log("[useChapter] Découpage en pages...", ast.blocks.length, "blocs");
    const compute = () => {
      const containerWidth = Math.min(720, Math.floor(window.innerWidth * 0.92));
      const maxHeight = Math.floor(window.innerHeight * 0.9);
      const chunks = chunkBlocksByHeight({ blocks: ast.blocks, containerWidth, maxHeight });
      console.log("[useChapter] Pages générées:", chunks.length);
      setPages(chunks);
    };
    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [ast]);

  // Expose resolvedUrl pour debug (non bloquant)
  return { loading, error, ast, pages, resolvedUrl };
}
