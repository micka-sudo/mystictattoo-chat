import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.scss';

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const isAdminRoute = location.pathname.startsWith('/admin');
    const isLoggedIn = Boolean(localStorage.getItem('admin_token'));

    useEffect(() => {
        fetch('http://localhost:4000/api/media/categories')
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error('Erreur chargement catégories', err));
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    return (
        <header className="header">
            <div className="header__container">
                <Link to="/" className="header__left" onClick={() => setMobileMenuOpen(false)}>
                    <img src="/logo.png" alt="Logo" className="header__logo" />
                    <span className="header__brand">Mystic Tattoo</span>
                </Link>

                <button
                    className="burger-btn"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                >
                    ☰
                </button>

                <nav className={`header__nav ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link className="nav__btn" to="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>

                    <div className="dropdown" ref={dropdownRef}>
                        <button className="nav__btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                            Galerie ▾
                        </button>
                        {dropdownOpen && (
                            <ul className="dropdown__menu">
                                {categories.map((cat) => (
                                    <li key={cat}>
                                        <Link
                                            to={`/gallery?style=${cat}`}
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Link className="nav__btn" to="/video" onClick={() => setMobileMenuOpen(false)}>Vidéo</Link>
                    <Link className="nav__btn" to="/reservation" onClick={() => setMobileMenuOpen(false)}>Réserver</Link>
                    <Link className="nav__btn" to="/admin/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>

                    {isAdminRoute && isLoggedIn && (
                        <button className="nav__btn" onClick={handleLogout}>
                            Déconnexion
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
