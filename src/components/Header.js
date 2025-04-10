// src/components/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const tattooStyles = [
    { id: 'oldschool', name: 'Old School' },
    { id: 'realiste', name: 'Réaliste' },
    { id: 'tribal', name: 'Tribal' },
    { id: 'japonais', name: 'Japonais' },
    { id: 'graphique', name: 'Graphique' },
    { id: 'minimaliste', name: 'Minimaliste' },
];

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Ferme le menu si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="header">
            <div className="header__container">
                <div className="header__left">
                    <img src="/logo.png" alt="Logo" className="header__logo" />
                    <span className="header__brand">Mystic Tattoo</span>
                </div>

                <nav className="header__nav">
                    <Link className="nav__btn" to="/">Accueil</Link>

                    <div className="dropdown" ref={dropdownRef}>
                        <button
                            className="nav__btn"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            Galerie ▾
                        </button>
                        {dropdownOpen && (
                            <ul className="dropdown__menu">
                                {tattooStyles.map((style) => (
                                    <li key={style.id}>
                                        <Link to={`/gallery?style=${style.id}`}>{style.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Link className="nav__btn" to="/video">Vidéo</Link>
                    <Link className="nav__btn" to="/reservation">Réserver</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
