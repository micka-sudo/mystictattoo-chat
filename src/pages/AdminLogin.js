import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Layout from '../layouts/Layout';
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
            try {
                const decoded = jwtDecode(token);
                const exp = decoded.exp * 1000;
                if (exp > Date.now()) {
                    // Token valide, rediriger
                    navigate('/admin/dashboard');
                } else {
                    // Token expiré, le supprimer
                    localStorage.removeItem('admin_token');
                }
            } catch (err) {
                // Token invalide, le supprimer
                console.error('Token invalide:', err);
                localStorage.removeItem('admin_token');
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
            console.error('Erreur de connexion :', err);
            setStatus('❌ Erreur serveur');
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
                console.error('Erreur de rafraîchissement du token :', err);
                localStorage.removeItem('admin_token');
                navigate('/admin/login');
            }
        };

        // toutes les 25 minutes (en ms)
        setInterval(refresh, 25 * 60 * 1000);
    };

    return (
        <Layout>
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
