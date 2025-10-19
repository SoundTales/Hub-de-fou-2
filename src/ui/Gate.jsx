import HubSplashLogo from '../HubSplashLogo.jsx'

export default function Gate({ refEl, className, baseUrl, onStart }) {
  return (
    <div ref={refEl} className={className}>
      <button className="gate__hit" aria-label="Lancer la liseuse" onClick={onStart}>
        <div className="gate__center">
          <span className="gate__msg">Touchez l'écran pour lancer la liseuse</span>
          <HubSplashLogo baseUrl={baseUrl} />
        </div>
      </button>
    </div>
  )
}

