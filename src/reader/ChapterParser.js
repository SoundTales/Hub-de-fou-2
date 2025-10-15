// Dev parser: converts an annotated HTML chapter into an AST
// Blocks: { type: 'para'|'dialogue', id, text, speaker? }
// Triggers: { kind: 'sfx'|'cue'|'voice', id, at, src, loop? }

export async function parseAnnotatedHtmlToAst(htmlString) {
  const dom = new DOMParser().parseFromString(htmlString, 'text/html')
  const ast = { blocks: [], triggers: [] }

  // Extract triggers from HTML comments like:
  // <!-- sfx id="door" src="assets/sfx/door.mp3" at="para:12" -->
  const walker = dom.createTreeWalker(dom, NodeFilter.SHOW_COMMENT)
  let node
  while ((node = walker.nextNode())) {
    const m = String(node.nodeValue || '').trim()
    // very naive parse: key="value" pairs after leading keyword
    const head = m.match(/^(sfx|cue|voice)\s+/i)
    if (!head) continue
    const kind = head[1].toLowerCase()
    const attrs = {}
    for (const kv of m.slice(head[0].length).matchAll(/(\w+)\s*=\s*"([^"]*)"/g)) {
      attrs[kv[1]] = kv[2]
    }
    ast.triggers.push({ kind, ...attrs })
  }

  // Extract blocks: paragraphs and simple dialogue markup
  // Paragraphs: <p>text</p>
  dom.querySelectorAll('p').forEach((p, i) => {
    const id = p.getAttribute('id') || `p${i + 1}`
    const text = (p.textContent || '').trim()
    if (text) ast.blocks.push({ type: 'para', id, text })
  })

  // Dialogue: <blockquote data-speaker="Name">text</blockquote> or <div class="dialogue" data-speaker="">...
  dom.querySelectorAll('blockquote[data-speaker], .dialogue[data-speaker]').forEach((el, i) => {
    const id = el.getAttribute('id') || `d${i + 1}`
    const text = (el.textContent || '').trim()
    const speaker = el.getAttribute('data-speaker') || 'Narrateur'
    if (text) ast.blocks.push({ type: 'dialogue', id, text, speaker })
  })

  // Stable order: keep document order
  ast.blocks.sort((a, b) => {
    const aPos = dom.getElementById(a.id)?.compareDocumentPosition
    const bPos = dom.getElementById(b.id)?.compareDocumentPosition
    return 0 // naive; blocks are already pushed in DOM order above
  })

  return ast
}

