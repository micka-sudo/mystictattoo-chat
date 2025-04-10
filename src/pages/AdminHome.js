// src/pages/AdminHome.js
import React from 'react';
import { Link } from 'react-router-dom';
import './AdminHome.scss';

const AdminHome = () => {
    return (
        <div className="admin-home">
            <h2>Espace Administrateur</h2>
            <p>Bienvenue dans l'interface d'administration de Mystic Tattoo.</p>

            <div className="admin-home__links">
                <Link to="/admin/login" className="admin-btn">Connexion</Link>
                <Link to="/admin" className="admin-btn">Upload</Link>
                <Link to="/admin/dashboard" className="admin-btn">Médias</Link>
            </div>
        </div>
    );
};

export default AdminHome;
