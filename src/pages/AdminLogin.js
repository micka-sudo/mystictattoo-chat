// src/pages/AdminLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Exemple d'appel API d’authentification, à adapter selon votre backend
            const res = await axios.post('http://localhost:5000/api/admin/login', credentials);

            if (res.data.token) {
                localStorage.setItem('adminToken', res.data.token);
                navigate('/admin/dashboard');
            }
        } catch (error) {
            setErrorMessage("Identifiants invalides");
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Admin - Connexion</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nom d'utilisateur :</label>
                    <input type="text" name="username" value={credentials.username} onChange={handleChange} required />
                </div>
                <div>
                    <label>Mot de passe :</label>
                    <input type="password" name="password" value={credentials.password} onChange={handleChange} required />
                </div>
                <button type="submit">Se connecter</button>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
}

export default AdminLogin;
