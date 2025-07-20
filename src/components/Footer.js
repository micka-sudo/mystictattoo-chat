import React, { useEffect, useState } from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <footer className={`${styles.footer} ${scrolled ? styles.footerScrolled : ''}`}>
            {/* ✅ Ligne du haut : Adresse + réseaux */}
            <div className={styles.footer__top}>
                <p className={styles.footer__address}>
                    <a
                        href="https://www.google.com/maps?q=19+Boulevard+Jean+Jaurès,+54000+Nancy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        📍 19 Boulevard Jean Jaurès, 54000 Nancy
                    </a>
                </p>

                <div className={styles.footer__links}>
                    <a
                        href="https://www.instagram.com/directory.nancy.tattoo.artists/p/CvKA3RAri-q/?locale=ne_NP"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src="/icons/instagram.png" alt="Instagram" />
                    </a>
                    <a
                        href="https://www.facebook.com/p/Mystic-Tattoo-Nancy-100057617876652/?locale=fr_FR"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src="/icons/facebook.png" alt="Facebook" />
                    </a>
                </div>
            </div>

            {/* ✅ Téléphone centré */}
            <div className={styles.footer__phone}>
                <a href="tel:0688862646">📞 06.88.86.26.46</a>
            </div>

            {/* ✅ Mention légale */}
            <div className={styles.footer__legal}>
                © {new Date().getFullYear()} Mystic Tattoo - Tous droits réservés
            </div>
        </footer>
    );
};

export default Footer;
