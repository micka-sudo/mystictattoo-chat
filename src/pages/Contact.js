import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import styles from './Contact.module.scss';

const SEO_KEYWORDS = "contact Mystic Tattoo, tatoueur Nancy, réseaux sociaux tatouage, salon tattoo Nancy";

const Contact = () => {
    return (
        <Layout>
            <SEO
                title="Contact - Mystic Tattoo | Tatoueur à Nancy 54000"
                description="Retrouvez toutes les infos pour contacter Mystic Tattoo à Nancy : adresse, téléphone, Instagram, Facebook."
                url="https://www.mystic-tattoo.fr/contact"
                keywords={SEO_KEYWORDS}
            />

            <section className={styles.contact}>
                <h1 className={styles.title}>Contact</h1>

                {/* 🎉 Message d’accueil sympa */}
                <p className={styles.intro}>
                    Une question, une idée de tatouage &nbsp;?
                    <br />
                    N’hésitez pas à me contacter ou à passer directement au salon ! 🤘
                </p>

                <div className={styles.card}>
                    <div className={styles.info}>
                        <div className={styles.infoItem}>
                            <img src="/icons/carte.png" alt="Adresse" />
                            <p><a href="https://www.google.com/maps?q=19+Boulevard+Jean+Jaurès,+54000+Nancy">19 Boulevard Jean Jaurès, 54000 Nancy</a></p>
                        </div>
                        <div className={styles.infoItem}>
                            <img src="/icons/sonnerie-du-telephone.png" alt="Téléphone" />
                            <p><a href="tel:+33688862646">06.88.86.26.46</a></p>
                        </div>
                    </div>

                    <div className={styles.socials}>
                        <h2>Suivez-nous</h2>
                        <div className={styles.socialLinks}>
                            <a href="https://www.instagram.com/mystictattoo" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/instagram.png" alt="Instagram" />
                            </a>
                            <a href="https://www.facebook.com/mystictattoo" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/facebook.png" alt="Facebook" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Contact;
