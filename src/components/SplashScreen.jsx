import { useEffect, useState } from 'react';
import logo from '../assets/logo.svg';

export default function SplashScreen({ onComplete }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Bloquer le scroll pendant le splash screen
    document.body.classList.add('no-scroll');

    // Durée de l'écran de démarrage (ex: 2 secondes)
    const timer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    // Attendre la fin de l'animation de fade-out avant de démonter
    const cleanup = setTimeout(() => {
      document.body.classList.remove('no-scroll'); // Rétablir le scroll
      onComplete();
    }, 2500); // 2000ms + 500ms de transition

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
      document.body.classList.remove('no-scroll'); // Sécurité
    };
  }, [onComplete]);

  if (!onComplete) return null;

  return (
    <div className={`splash-screen ${isFading ? 'splash-screen--hidden' : ''}`}>
      <div className="splash-content">
        <img src={logo} alt="Sound Tales" className="splash-logo" />
        <div className="splash-loader">
          <div className="splash-bar"></div>
        </div>
      </div>
    </div>
  );
}
