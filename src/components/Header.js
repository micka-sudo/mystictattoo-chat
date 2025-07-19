import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import useCategories from '../hooks/useCategories';

/**
 * Composant d'en-tête principal du site.
 * Affiche le logo, les liens de navigation, la galerie (dropdown), et le menu mobile.
 */
const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dropdownRef = useRef(null);
    const dropdownMenuRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { categories = [] } = useCategories();

    const isAdminLoggedIn = Boolean(localStorage.getItem('admin_token'));

    const showReservation = false;
    const showLogin = false;

    // Ferme le dropdown si on clique en dehors
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
        <header className={styles.header}>
            <div className={styles.header__container}>
                {/* Logo et titre à gauche */}
                <Link to="/" className={styles.header__left} onClick={() => setMobileMenuOpen(false)}>
                    <img src="/logo.png" alt="Logo" className={styles.header__logo} />
                    <span className={styles.header__brand}>Mystic Tattoo</span>
                </Link>

                {/* Menu central : liens principaux */}
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
                            {/* 🔹 Lien vers "Tous" */}
                            <li>
                                <Link
                                    to="/gallery"
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    Tous
                                </Link>
                            </li>

                            {/* 🔁 Liens dynamiques vers chaque catégorie */}
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/gallery/${cat}`}
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

                    {/* Lien vers la page de contact */}
                    <Link
                        className={styles.nav__btn}
                        to="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Contact
                    </Link>

                    {/* Lien vers la réservation - désactivé ici mais prêt à être activé */}
                    {showReservation && (
                        <Link
                            className={styles.nav__btn}
                            to="/reservation"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Réserver
                        </Link>
                    )}

                    {/* Connexion admin */}
                    {showLogin && !isAdminLoggedIn && (
                        <Link
                            className={styles.nav__btn}
                            to="/admin/login"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Connexion
                        </Link>
                    )}

                    {/* Lien admin si connecté */}
                    {isAdminLoggedIn && (
                        <>
                            <Link
                                className={styles.nav__btn}
                                to="/admin/home"
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

                {/* Logo et titre à droite (mobile/tablette) */}
                <Link to="/" className={styles.header__right} onClick={() => setMobileMenuOpen(false)}>
                    <span className={styles.header__brand}>Mystic Tattoo</span>
                    <img src="/logo.png" alt="Logo" className={styles.header__logo} />
                </Link>

                {/* Bouton burger mobile */}
                <button
                    className={styles.burgerBtn}
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                >
                    ☰
                </button>
            </div>
        </header>
    );
};

export default Header;
