export default function IABanner({ inApp, mode, onOpen, onCopy }) {
  if (!inApp || mode === 'hidden') return null
  if (mode === 'compact') {
    return (
      <div className="iab-banner iab-banner--compact" role="region" aria-label="Ouvrir dans le navigateur">
        <button className="iab-btn" type="button" onClick={onOpen}>Ouvrir dans le navigateur</button>
      </div>
    )
  }
  return (
    <div className="iab-banner" role="region" aria-label="Ouvrir dans le navigateur">
      <p className="iab-text">Pour profiter du plein écran, lancez la liseuse dans votre navigateur préféré.</p>
      <div className="iab-actions">
        <button className="iab-btn" type="button" onClick={onOpen}>Ouvrir dans le navigateur</button>
        <button className="iab-btn iab-btn--ghost" type="button" onClick={onCopy}>Copier le lien</button>
      </div>
    </div>
  )
}

