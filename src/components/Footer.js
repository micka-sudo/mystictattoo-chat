import React from 'react';
import './Footer.scss';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__container">
                <p className="footer__address">
                    📍 19 Boulevard Jean Jaurès, 54000 Nancy
                </p>

                <form
                    className="footer__newsletter"
                    onSubmit={(e) => {
                        e.preventDefault();
                        alert("Fonctionnalité d'envoi à connecter !");
                    }}
                >
                    <input type="email" placeholder="Votre email" required />
                    <button type="submit">S'inscrire</button>
                </form>

                <div className="footer__links">
                    <a
                        href="https://www.instagram.com/directory.nancy.tattoo.artists/p/CvKA3RAri-q/?locale=ne_NP"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Instagram
                    </a>
                    <a
                        href="https://www.facebook.com/p/Mystic-Tattoo-Nancy-100057617876652/?locale=fr_FR"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Facebook
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
