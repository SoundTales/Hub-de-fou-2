import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import ScrollToTop from './components/ScrollToTop';
import SplashScreen from './components/SplashScreen';

const Accueil = lazy(() => import('./pages/Accueil'));
const Hub = lazy(() => import('./pages/Hub'));
const TaleLanding = lazy(() => import('./pages/TaleLanding'));
const Liseuse = lazy(() => import('./pages/Liseuse'));
const CreerTale = lazy(() => import('./pages/CreerTale'));
const Legal = lazy(() => import('./pages/Legal'));

function App() {
  // Initialisation paresseuse pour éviter le flash au rafraîchissement
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('hasSeenSplash');
  });

  // Retire le masque de pré-chargement dès que l'app est montée,
  // même si le splash est déjà désactivé (hasSeenSplash présent).
  useEffect(() => {
    document.documentElement.classList.add('app-ready');
  }, []);

  // L'effet n'est plus nécessaire pour l'initialisation, 
  // mais on garde la logique de complétion via le callback

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <ScrollToTop />
      <Suspense fallback={<div style={{ height: '100vh', backgroundColor: '#1f2023' }}></div>}>
        <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/hub" element={<Hub />} />
          <Route path="/creer-tale" element={<CreerTale />} />
          
          {/* Nouvelle route pour la page de présentation du Tale (Ton ancien Hub) */}
          <Route path="/tale/:taleId" element={<TaleLanding />} />

          {/* Pages Légales */}
          <Route path="/mentions-legales" element={<Legal type="mentions-legales" />} />
          <Route path="/confidentialite" element={<Legal type="confidentialite" />} />
          <Route path="/cgu" element={<Legal type="cgu" />} />
        </Route>
        
        {/* La liseuse reste en dehors du layout principal si tu veux le plein écran */}
        <Route path="/lecture/:taleId/:chapterId" element={<Liseuse />} />
      </Routes>
    </Suspense>
    </>
  );
}

export default App;
