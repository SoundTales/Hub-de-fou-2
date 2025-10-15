import { useEffect, useState } from "react";
import { getChapterAst } from "../api/client.js";
import { parseAnnotatedHtmlToAst } from "./ChapterParser.js";
import { chunkBlocksByHeight } from "./Chunker.js";

export function useChapter({ taleId = "tale1", chapterId, baseUrl = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ast, setAst] = useState(null);
  const [pages, setPages] = useState([]);

  const withBase = (p) => {
    const b = baseUrl || (import.meta?.env?.BASE_URL || "/");
    return `${b.endsWith("/") ? b : b + "/"}${p.replace(/^\/?/, "")}`;
  };

  useEffect(() => {
    let alive = true;

    async function tryFetchMany(urls) {
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          return await res.json();
        } catch {}
      }
      throw new Error("Chapter AST not found");
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 1) API puis mock JSON (via client)
        const data = await getChapterAst(taleId, chapterId, { baseUrl });
        if (alive) setAst(data);
      } catch (err) {
        try {
          // 2) Mock JSON direct, plusieurs chemins
          const data = await tryFetchMany([
            withBase(`mock/chapters/${taleId}/${chapterId}.json`),
            `/mock/chapters/${taleId}/${chapterId}.json`,
            `mock/chapters/${taleId}/${chapterId}.json`,
          ]);
          if (alive) setAst(data);
        } catch (err2) {
          try {
            // 3) HTML annoté → AST
            const res = await fetch(withBase(`mock/chapters/${taleId}/${chapterId}.html`));
            const html = await res.text();
            const parsed = await parseAnnotatedHtmlToAst(html);
            if (alive) setAst(parsed);
          } catch (err3) {
            // 4) Inline minimal (dernière chance)
            const inline = {
              id: String(chapterId),
              taleId,
              title: `Chapitre ${chapterId}`,
              blocks: [
                { type: "para", id: "p1", text: "C'était toujours pareil..." },
                { type: "dialogue", id: "d1", speaker: "Malone", text: "On s'occupe de tout. On va faire le reste." },
                { type: "para", id: "p2", text: "Elle secoua sa tête de haut en bas..." },
                { type: "para", id: "p3", text: "Le monde autour resta là jusqu'à l'aube..." },
              ],
              triggers: [
                { kind: "cue", id: "intro", at: "progress:0.0", src: "/signature.mp3", loop: true },
                { kind: "sfx", id: "door", at: "para:p2", src: "/signature.mp3" },
                { kind: "voice", id: "d1", at: "dialogue:d1", src: "/signature.mp3" },
              ],
            };
            if (alive) setAst(inline);
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [taleId, chapterId, baseUrl]);

  // Re-chunk sur resize
  useEffect(() => {
    if (!ast?.blocks) {
      setPages([]);
      return;
    }
    const compute = () => {
      const containerWidth = Math.min(720, Math.floor(window.innerWidth * 0.92));
      const maxHeight = Math.floor(window.innerHeight * 0.9);
      const chunks = chunkBlocksByHeight({ blocks: ast.blocks, containerWidth, maxHeight });
      setPages(chunks);
    };
    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [ast]);

  return { loading, error, ast, pages };
}
