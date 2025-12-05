import { Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Hub from './pages/Hub';
import TaleLanding from './pages/TaleLanding';
import Liseuse from './pages/Liseuse';
import CreerTale from './pages/CreerTale';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Accueil />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/creer-tale" element={<CreerTale />} />
        
        {/* Nouvelle route pour la page de présentation du Tale (Ton ancien Hub) */}
        <Route path="/tale/:taleId" element={<TaleLanding />} />
      </Route>
      
      {/* La liseuse reste en dehors du layout principal si tu veux le plein écran */}
      <Route path="/lecture/:taleId/:chapterId" element={<Liseuse />} />
    </Routes>
  );
}

export default App;
