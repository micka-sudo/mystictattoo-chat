// index.js - React 18
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.scss';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);

// Enregistrement du Service Worker pour PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('SW enregistre:', registration.scope);
            })
            .catch((error) => {
                console.error('Erreur SW:', error);
            });
    });
}
