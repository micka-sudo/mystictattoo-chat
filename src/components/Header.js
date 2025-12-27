import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import useCategories from '../hooks/useCategories';

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dropdownRef = useRef(null);
    const { categories = [] } = useCategories();
    const filteredCategories = categories.filter(cat => cat.toLowerCase() !== 'flash');

    const navigate = useNavigate();
    const isAdminLoggedIn = Boolean(localStorage.getItem('admin_token'));

    const showReservation = false;
    const showLogin = true;

    // Ferme dropdown et menu mobile au clic extérieur
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Ferme le menu mobile au changement de route
    const closeMenus = useCallback(() => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.header__container}>
                {/* Logo + Titre */}
                <Link to="/" className={styles.header__brand} onClick={closeMenus}>
                    <img
                        src="/logo.webp"
                        alt="Mystic Tattoo"
                        className={styles.header__logo}
                        width="50"
                        height="50"
                    />
                    <span className={styles.header__title}>Mystic Tattoo</span>
                </Link>

                {/* Navigation */}
                <nav className={`${styles.header__nav} ${mobileMenuOpen ? styles['header__nav--open'] : ''}`}>
                    <Link className={styles.nav__link} to="/" onClick={closeMenus}>
                        Accueil
                    </Link>

                    {/* Dropdown Galerie */}
                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            className={`${styles.nav__link} ${styles.dropdown__toggle}`}
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            aria-expanded={dropdownOpen}
                            aria-haspopup="true"
                        >
                            Galerie
                            <span className={`${styles.dropdown__arrow} ${dropdownOpen ? styles['dropdown__arrow--open'] : ''}`}>▾</span>
                        </button>

                        <ul className={`${styles.dropdown__menu} ${dropdownOpen ? styles['dropdown__menu--open'] : ''}`}>
                            <li>
                                <Link to="/gallery" onClick={closeMenus}>Tous les styles</Link>
                            </li>
                            {filteredCategories.map((cat) => (
                                <li key={cat}>
                                    <Link to={`/gallery/${cat}`} onClick={closeMenus}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link className={styles.nav__link} to="/flash" onClick={closeMenus}>
                        Flash
                    </Link>

                    <Link className={styles.nav__link} to="/contact" onClick={closeMenus}>
                        Contact
                    </Link>

                    {showLogin && !isAdminLoggedIn && (
                        <Link className={styles.nav__link} to="/admin/login" onClick={closeMenus}>
                            Connexion
                        </Link>
                    )}

                    {showReservation && (
                        <Link className={styles.nav__link} to="/reservation" onClick={closeMenus}>
                            Réserver
                        </Link>
                    )}

                    {isAdminLoggedIn && (
                        <>
                            <Link className={styles.nav__link} to="/admin/dashboard" onClick={closeMenus}>
                                Admin
                            </Link>
                            <button className={`${styles.nav__link} ${styles['nav__link--btn']}`} onClick={handleLogout}>
                                Déconnexion
                            </button>
                        </>
                    )}
                </nav>

                {/* Menu burger (mobile) */}
                <button
                    className={`${styles.burger} ${mobileMenuOpen ? styles['burger--open'] : ''}`}
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    aria-label="Menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
