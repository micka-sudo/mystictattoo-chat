import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';
import { decodeUsableToken, clearAdminToken } from '../lib/auth';

const RequireAuth = ({ children }) => {
    const [isValid, setIsValid] = useState(null); // null = chargement
    const token = localStorage.getItem('admin_token');

    useEffect(() => {
        const checkAndRefreshToken = async () => {
            if (!token) {
                setIsValid(false);
                return;
            }

            try {
                const decoded = decodeUsableToken(token);
                if (!decoded) {
                    console.warn('⛔ Token expiré ou invalide');
                    clearAdminToken();
                    setIsValid(false);
                    return;
                }

                const exp = decoded.exp * 1000;
                const now = Date.now();

                // ⏱ Rafraîchir si moins de 10 minutes restantes
                if (exp - now < 10 * 60 * 1000) {
                    console.log('🔄 Rafraîchissement du token');
                    const res = await api.post('/login/refresh-token', { token });

                    if (res.data.token) {
                        localStorage.setItem('admin_token', res.data.token);
                    } else {
                        throw new Error('Pas de nouveau token reçu');
                    }
                }

                setIsValid(true);
            } catch (err) {
                console.error('❌ Erreur décodage ou rafraîchissement token :', err?.message);
                clearAdminToken();
                setIsValid(false);
            }
        };

        checkAndRefreshToken();
    }, [token]);

    if (isValid === null) return null; // En attente de validation
    if (!isValid) return <Navigate to="/admin/login" replace />;
    return children;
};

export default RequireAuth;
