import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.scss';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                // ✅ Stocke le token et redirige
                localStorage.setItem('admin_token', data.token);
                setStatus('✅ Connexion réussie');
                navigate('/admin');
            } else {
                setStatus('❌ Mot de passe incorrect');
            }
        } catch (err) {
            setStatus('❌ Erreur de connexion');
            console.error(err);
        }
    };

    return (
        <div className="admin-login">
            <h2>Connexion Admin</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="password"
                    placeholder="Mot de passe admin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Se connecter</button>
            </form>
            {status && <p className="status">{status}</p>}
        </div>
    );
};

export default AdminLogin;
