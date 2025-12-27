import React from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__container}>
                {/* Adresse */}
                <a
                    href="https://www.google.com/maps?q=19+Boulevard+Jean+Jaurès,+54000+Nancy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footer__address}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    19 Boulevard Jean Jaurès, 54000 Nancy
                </a>

                {/* Centre : téléphone + copyright */}
                <div className={styles.footer__center}>
                    <a href="tel:0688862646" className={styles.footer__phone}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        06.88.86.26.46
                    </a>
                    <span className={styles.footer__copyright}>
                        © {new Date().getFullYear()} Mystic Tattoo
                    </span>
                </div>

                {/* Réseaux sociaux */}
                <div className={styles.footer__social}>
                    <a
                        href="https://www.instagram.com/directory.nancy.tattoo.artists/p/CvKA3RAri-q/?locale=ne_NP"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                    >
                        <img src="/icons/instagram.webp" alt="" width="24" height="24" loading="lazy" />
                    </a>
                    <a
                        href="https://www.facebook.com/p/Mystic-Tattoo-Nancy-100057617876652/?locale=fr_FR"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                    >
                        <img src="/icons/facebook.webp" alt="" width="24" height="24" loading="lazy" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
