import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import styles from './AdminLogin.module.scss';
import api from '../lib/api';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus('⏳ Connexion en cours...');

        try {
            const res = await api.post('/login', { password });

            if (res.status === 200 && res.data.token) {
                localStorage.setItem('admin_token', res.data.token);
                setStatus('✅ Connexion réussie');
                navigate('/admin');
            } else {
                setStatus('❌ Mot de passe incorrect');
            }
        } catch (err) {
            setStatus('❌ Erreur serveur');
            console.error('Erreur de connexion :', err);
        }
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
