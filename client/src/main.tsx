import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.js';
import { AuthProvider } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { ToastProvider } from './context/ToastContext.js';
import './index.css';

const storedClientId = typeof window !== 'undefined' ? localStorage.getItem('custom_google_client_id') : null;
const GOOGLE_CLIENT_ID =
  storedClientId ||
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '1048293847291-demo-peoplebooks-google-oauth.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

