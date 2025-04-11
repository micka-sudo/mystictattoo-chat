import React, { useEffect, useState } from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <footer className={`${styles.footer} ${scrolled ? styles.footerScrolled : ''}`}>
            <div className={styles.footer__container}>
                {/* 📍 Adresse */}
                <p className={styles.footer__address}>
                    📍 19 Boulevard Jean Jaurès, 54000 Nancy
                </p>

                {/* 📧 Newsletter */}
                <form
                    className={styles.footer__newsletter}
                    onSubmit={(e) => {
                        e.preventDefault();
                        alert("Fonctionnalité d'envoi à connecter !");
                    }}
                >
                    <input type="email" placeholder="Votre email" required />
                    <button type="submit">S'inscrire</button>
                </form>

                {/* 🔗 Réseaux sociaux */}
                <div className={styles.footer__links}>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/instagram.ico" alt="Instagram" />
                    </a>
                    <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/facebook.ico" alt="Facebook" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
