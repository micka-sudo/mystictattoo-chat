// src/components/Header.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.scss'; // Utilisation d'un fichier SCSS pour les styles

const Header = () => {
    return (
        <header className="header">
            <div className="header__logo">
                <Link to="/">Mystic Tattoo</Link>
            </div>
            <nav className="header__nav">
                <ul>
                    <li><NavLink to="/" end activeClassName="active">Accueil</NavLink></li>
                    <li><NavLink to="/gallery" activeClassName="active">Galerie</NavLink></li>
                    <li><NavLink to="/reservation" activeClassName="active">Réservation</NavLink></li>
                    <li><NavLink to="/admin/login" activeClassName="active">Admin</NavLink></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
