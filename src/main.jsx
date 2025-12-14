import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'
import { AuthProvider } from './supabase/AuthContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import ToastContainer from './components/ui/ToastContainer.jsx'

const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
          <ToastContainer />
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
)
