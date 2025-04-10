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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

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

                {/* Burger menu visible en mobile */}
                <button
                    className="burger-btn"
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                >
                    ☰
                </button>

                <nav className={`header__nav ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link className="nav__btn" to="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>

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
                                        <Link to={`/gallery?style=${style.id}`} onClick={() => setMobileMenuOpen(false)}>
                                            {style.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Link className="nav__btn" to="/video" onClick={() => setMobileMenuOpen(false)}>Vidéo</Link>
                    <Link className="nav__btn" to="/reservation" onClick={() => setMobileMenuOpen(false)}>Réserver</Link>
                    <Link className="nav__btn" to="/admin/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
