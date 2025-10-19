export default function Quickbar({
  visible,
  showScrollTop,
  baseUrl,
  onScrollTop,
  onPlay,
  onOpenBookmarks,
  onToggleFullscreen,
  fullscreenActive,
}) {
  return (
    <div
      className={`quickbar ${visible ? 'is-on' : 'is-off'}`}
      role="region"
      aria-label="Actions rapides"
      aria-hidden={!visible}
    >
      <button
        className={`qbtn ${showScrollTop ? '' : 'is-hidden'}`}
        type="button"
        onClick={onScrollTop}
        aria-hidden={!showScrollTop}
        aria-label="Remonter en haut"
        title="Remonter"
      >
        <img className="qicon qicon--svg" src={`${baseUrl}icons/chevron-up.svg`} alt="" aria-hidden="true" />
      </button>
      <button className="qbtn qbtn--primary" type="button" onClick={onPlay} aria-label="Lire/Reprendre" title="Lire/Reprendre">
        <img className="qicon qicon--svg" src={`${baseUrl}icons/play.svg`} alt="" aria-hidden="true" />
      </button>
      {typeof onToggleFullscreen === 'function' && (
        <button
          className={`qbtn qbtn--fullscreen ${fullscreenActive ? 'is-active' : ''}`}
          type="button"
          onClick={onToggleFullscreen}
          aria-label={fullscreenActive ? 'Quitter le plein \u00E9cran' : 'Activer le plein \u00E9cran'}
          title={fullscreenActive ? 'Quitter le plein \u00E9cran' : 'Activer le plein \u00E9cran'}
        >
          {fullscreenActive ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 4H4v5" />
              <path d="M15 4h5v5" />
              <path d="M4 15v5h5" />
              <path d="M20 15v5h-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9V4h5" />
              <path d="M20 9V4h-5" />
              <path d="M4 15v5h5" />
              <path d="M20 15v5h-5" />
            </svg>
          )}
        </button>
      )}
      <button className="qbtn qbtn--bookmark" type="button" onClick={onOpenBookmarks} aria-label="Signets: chapitres favoris" title="Ouvrir les signets">
        <img className="qicon qicon--svg" src={`${baseUrl}icons/bookmark.svg`} alt="" aria-hidden="true" />
      </button>
    </div>
  )
}
