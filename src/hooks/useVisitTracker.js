import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';

// Générer un ID de session unique
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('visit_session_id');
    if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('visit_session_id', sessionId);
    }
    return sessionId;
};

const useVisitTracker = () => {
    const location = useLocation();
    const lastTrackedPath = useRef(null);

    useEffect(() => {
        const currentPath = location.pathname;

        // Éviter de tracker plusieurs fois la même page
        if (lastTrackedPath.current === currentPath) {
            return;
        }

        // Ne pas tracker les pages admin
        if (currentPath.startsWith('/admin')) {
            return;
        }

        lastTrackedPath.current = currentPath;

        // Envoyer la visite à l'API
        const trackVisit = async () => {
            try {
                await api.post('/stats/visit', {
                    page: currentPath,
                    sessionId: getSessionId(),
                });
            } catch (err) {
                // Silencieux en cas d'erreur pour ne pas impacter l'UX
                console.debug('Tracking visit failed:', err.message);
            }
        };

        // Petit délai pour éviter les requêtes sur navigation rapide
        const timeoutId = setTimeout(trackVisit, 300);

        return () => clearTimeout(timeoutId);
    }, [location.pathname]);
};

export default useVisitTracker;
