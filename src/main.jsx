import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './gesturePrime.js';

// Input-modality: pointer vs keyboard (Tab) to control focus rings on mobile
(() => {
  if (typeof document === 'undefined') return;
  const setPointer = () => { try { document.body.dataset.input = 'pointer'; } catch {} };
  const setKeyboard = (e) => { if (e?.key === 'Tab') { try { document.body.dataset.input = 'keyboard'; } catch {} } };
  window.addEventListener('pointerdown', setPointer, true);
  window.addEventListener('touchstart', setPointer, true);
  window.addEventListener('mousedown', setPointer, true);
  window.addEventListener('keydown', setKeyboard, true);
})();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>Erreur de chargement</h1>
          <p>Une erreur s'est produite lors du chargement de l'application.</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Details techniques</summary>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (!root) {
  document.body.innerHTML = '<div style="padding:20px;">Erreur: element root non trouve</div>';
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
