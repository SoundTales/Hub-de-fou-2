// Chunker: lays out blocks into pages fitting roughly one viewport height
// Strategy: measure offscreen in a fixed-width container, pack by paragraph/dialogue boundaries

export function chunkBlocksByHeight({ blocks, containerWidth = 720, maxHeight = null, fontScale = 1 }) {
  if (!Array.isArray(blocks)) return []
  const pages = []

  // create a detached measuring container
  const measureRoot = document.createElement('div')
  Object.assign(measureRoot.style, {
    position: 'absolute', left: '-99999px', top: '0', width: `${containerWidth}px`,
    visibility: 'hidden', pointerEvents: 'none'
  })
  document.body.appendChild(measureRoot)

  const page = []
  let accHeight = 0
  const pageMax = maxHeight || Math.max(200, Math.floor(window.innerHeight * 0.9))

  for (const b of blocks) {
    const el = document.createElement(b.type === 'para' ? 'p' : 'div')
    el.textContent = b.type === 'dialogue' && b.speaker ? `${b.speaker} : ${b.text}` : b.text
    el.style.fontSize = `${16 * fontScale}px`
    el.style.lineHeight = '1.6'
    el.style.margin = '0 0 12px 0'
    measureRoot.appendChild(el)
    const h = el.getBoundingClientRect().height

    if (accHeight + h > pageMax && page.length) {
      pages.push({ index: pages.length, blocks: page.splice(0, page.length) })
      accHeight = 0
    }
    page.push(b)
    accHeight += h
  }
  if (page.length) pages.push({ index: pages.length, blocks: page })

  measureRoot.remove()
  return pages
}

