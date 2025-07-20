import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import useCategories from '../hooks/useCategories';

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dropdownRef = useRef(null);
    const dropdownMenuRef = useRef(null);
    const { categories = [] } = useCategories();
    const filteredCategories = categories.filter(cat => cat.toLowerCase() !== 'flash');

    const location = useLocation();
    const navigate = useNavigate();
    const isAdminLoggedIn = Boolean(localStorage.getItem('admin_token'));

    const showReservation = false;
    const showLogin = false;

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
                {/* Logo gauche */}
                <Link to="/" className={styles.header__left} onClick={() => setMobileMenuOpen(false)}>
                    <img src="/logo.png" alt="Logo Mystic Tattoo" className={styles.header__logo} />
                    <span className={styles.header__brand}>Mystic Tattoo</span>
                </Link>

                {/* NAVIGATION CENTRALE */}
                <nav
                    className={`${styles.header__nav} ${mobileMenuOpen ? styles.open : ''}`}
                    onMouseLeave={() => setDropdownOpen(false)}
                >
                    <Link className={styles.nav__btn} to="/" onClick={() => setMobileMenuOpen(false)}>
                        Accueil
                    </Link>

                    {/* Dropdown Galerie */}
                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            className={`${styles.nav__btn} ${styles.dropdownToggle} ${dropdownOpen ? styles.open : ''}`}
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            aria-expanded={dropdownOpen}
                        >
                            Galerie
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
                            <li>
                                <Link to="/gallery" onClick={() => {
                                    setDropdownOpen(false);
                                    setMobileMenuOpen(false);
                                }}>Tous</Link>
                            </li>

                            {filteredCategories.map((cat) => (
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

                    {/* Lien Flash */}
                    <Link className={styles.nav__btn} to="/flash" onClick={() => setMobileMenuOpen(false)}>
                        Flash
                    </Link>

                    {/* Contact */}
                    <Link className={styles.nav__btn} to="/contact" onClick={() => setMobileMenuOpen(false)}>
                        Contact
                    </Link>

                    {/* Admin / Login */}
                    {isAdminLoggedIn && (
                        <>
                            <Link className={styles.nav__btn} to="/admin/home" onClick={() => setMobileMenuOpen(false)}>
                                🛠 Admin
                            </Link>
                            <button className={styles.nav__btn} onClick={handleLogout}>
                                Déconnexion
                            </button>
                        </>
                    )}

                    {showLogin && !isAdminLoggedIn && (
                        <Link className={styles.nav__btn} to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                            Connexion
                        </Link>
                    )}

                    {showReservation && (
                        <Link className={styles.nav__btn} to="/reservation" onClick={() => setMobileMenuOpen(false)}>
                            Réserver
                        </Link>
                    )}
                </nav>

                {/* Bloc droit (mobile only : masqué sur petit écran) */}
                <Link to="/" className={styles.header__right} onClick={() => setMobileMenuOpen(false)}>
                    <span className={styles.header__brand}>Mystic Tattoo</span>
                    <img src="/logo.png" alt="Logo" className={styles.header__logo} />
                </Link>

                {/* Menu Burger mobile */}
                <button
                    className={styles.burgerBtn}
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    aria-label="Menu mobile"
                >
                    ☰
                </button>
            </div>
        </header>
    );
};

export default Header;
