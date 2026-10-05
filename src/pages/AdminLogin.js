import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { decodeUsableToken, clearAdminToken } from '../lib/auth';
import styles from './AdminLogin.module.scss';
import api from '../lib/api';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    // ✅ Redirection automatique si déjà connecté avec token valide
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            if (decodeUsableToken(token)) {
                // Token valide, rediriger
                navigate('/admin/dashboard');
            } else {
                // Token expiré ou ancien format, le supprimer
                clearAdminToken();
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus('⏳ Connexion en cours...');

        try {
            const res = await api.post('/login', { password });

            if (res.status === 200 && res.data.token) {
                localStorage.setItem('admin_token', res.data.token);
                setStatus('✅ Connexion réussie');
                startAutoRefresh(res.data.token);
                navigate('/admin/dashboard');
            } else {
                setStatus('❌ Mot de passe incorrect');
            }
        } catch (err) {
            // Ne pas journaliser l'objet d'erreur complet : il contient le mot de passe envoyé
            const code = err?.response?.status;
            if (code === 401) {
                setStatus('❌ Mot de passe incorrect');
            } else if (code === 429) {
                setStatus('❌ Trop de tentatives, réessayez dans 15 minutes');
            } else {
                console.error('Erreur de connexion :', err?.message);
                setStatus('❌ Erreur serveur');
            }
        }
    };

    // ✅ Mise à jour automatique du token toutes les 25 minutes
    const startAutoRefresh = (initialToken) => {
        const refresh = async () => {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            try {
                const res = await api.post('/login/refresh-token', { token });
                if (res.status === 200 && res.data.token) {
                    localStorage.setItem('admin_token', res.data.token);
                } else {
                    console.warn('❌ Token expiré, déconnexion');
                    localStorage.removeItem('admin_token');
                    navigate('/admin/login');
                }
            } catch (err) {
                console.error('Erreur de rafraîchissement du token :', err?.message);
                localStorage.removeItem('admin_token');
                navigate('/admin/login');
            }
        };

        // toutes les 25 minutes (en ms)
        setInterval(refresh, 25 * 60 * 1000);
    };

    return (
        <Layout>
            <SEO title="Connexion admin - Mystic Tattoo" url="https://www.mystic-tattoo.fr/admin/login" noindex />
            <div className={styles.adminLogin}>
                <h2>Connexion Admin</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Mot de passe admin"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Se connecter</button>
                </form>
                {status && <p className={styles.status}>{status}</p>}
            </div>
        </Layout>
    );
};

export default AdminLogin;
