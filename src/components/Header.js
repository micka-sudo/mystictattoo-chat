import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import useCategories from '../hooks/useCategories';

const Header = () => {
    // État pour gérer l'ouverture du dropdown "Galerie"
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // État pour le menu mobile (affichage burger menu)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Références pour détecter les clics en dehors du dropdown
    const dropdownRef = useRef(null);
    const dropdownMenuRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Récupération des styles de tatouage (catégories)
    const { categories = [] } = useCategories();

    // Vérifie si un token admin est présent en localStorage
    const isAdminLoggedIn = Boolean(localStorage.getItem('admin_token'));

    // Variables pour contrôler l'affichage conditionnel
    const showReservation = false;
    const showLogin = false;

    // Ferme le menu déroulant si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Déconnexion administrateur
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.header__container}>
                <Link to="/" className={styles.header__left} onClick={() => setMobileMenuOpen(false)}>
                    <img src="/logo.png" alt="Logo" className={styles.header__logo} />
                    <span className={styles.header__brand}>Mystic Tattoo</span>
                </Link>

                <button
                    className={styles.burgerBtn}
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                >
                    ☰
                </button>

                {/* Menu de navigation principal */}
                <nav
                    className={`${styles.header__nav} ${mobileMenuOpen ? styles.open : ''}`}
                    onMouseLeave={() => setMobileMenuOpen(false)}
                >
                    <Link
                        className={styles.nav__btn}
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Accueil
                    </Link>

                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            className={`${styles.nav__btn} ${styles.dropdownToggle} ${dropdownOpen ? styles.open : ''}`}
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            Galerie <span className={styles.chevron}></span>
                        </button>

                        <ul
                            ref={dropdownMenuRef}
                            className={`${styles.dropdown__menu} ${dropdownOpen ? styles.open : ''}`}
                            style={{
                                maxHeight: dropdownOpen && dropdownMenuRef.current
                                    ? `${dropdownMenuRef.current.scrollHeight}px`
                                    : '0px'
                            }}
                        >
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
                    </div>

                    {/* Réserver : activable avec showReservation */}
                    {showReservation && (
                        <Link
                            className={styles.nav__btn}
                            to="/reservation"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Réserver
                        </Link>
                    )}

                    {/* Connexion : visible uniquement si admin non connecté et showLogin à true */}
                    {showLogin && !isAdminLoggedIn && (
                        <Link
                            className={styles.nav__btn}
                            to="/admin/login"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Connexion
                        </Link>
                    )}

                    {/* Zone admin : visible uniquement si connecté */}
                    {isAdminLoggedIn && (
                        <>
                            <Link
                                className={styles.nav__btn}
                                to="/admin"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                🛠 Administration
                            </Link>
                            <button
                                className={styles.nav__btn}
                                onClick={handleLogout}
                            >
                                Déconnexion
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
