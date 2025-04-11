import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const dropdownRef = useRef(null);
    const dropdownMenuRef = useRef(null);
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
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
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
                <Link to="/" className={styles.header__left} onClick={() => setMobileMenuOpen(false)}>
                    <img src="/logo.png" alt="Logo" className={styles.header__logo} />
                    <span className={styles.header__brand}>Mystic Tattoo</span>
                </Link>

                <button className={styles.burgerBtn} onClick={() => setMobileMenuOpen((prev) => !prev)}>
                    ☰
                </button>

                <nav className={`${styles.header__nav} ${mobileMenuOpen ? styles.open : ''}`}>
                    <Link className={styles.nav__btn} to="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>

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

                    <Link className={styles.nav__btn} to="/reservation" onClick={() => setMobileMenuOpen(false)}>Réserver</Link>
                    <Link className={styles.nav__btn} to="/admin/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>

                    {isAdminRoute && isLoggedIn && (
                        <button className={styles.nav__btn} onClick={handleLogout}>
                            Déconnexion
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
