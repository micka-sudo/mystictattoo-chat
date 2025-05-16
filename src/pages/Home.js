import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './Home.module.scss';
import api, { apiBase } from "../lib/api";
import SEO from '../components/SEO'; // ← SEO

// Mots-clés principaux (à réutiliser sur chaque page, adapte si besoin)
const SEO_KEYWORDS = "tatoueur Nancy, salon de tatouage Nancy, tatouage Nancy, Mystic Tattoo, tattoo Nancy, tatoueur artistique Nancy, tatouage personnalisé Nancy, galerie tatouage Nancy, meilleur tatoueur Nancy, tatouage réaliste Nancy, tatouage japonais Nancy, tatouage oldschool Nancy, rendez-vous tatouage Nancy, tarif tatouage Nancy";

const SCHEMA_ORG = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    "name": "Mystic Tattoo",
    "image": "https://www.mystic-tattoo.fr/logo.png",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "23 Rue des Arts",
        "addressLocality": "Nancy",
        "postalCode": "54000",
        "addressCountry": "FR"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 48.6921,
        "longitude": 6.1844
    },
    "telephone": "+33612345678",
    "url": "https://www.mystic-tattoo.fr"
};

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [news, setNews] = useState([]);
    const [showNews, setShowNews] = useState(true);

    // Image aléatoire d'accueil
    const fetchRandomImage = async () => {
        try {
            const res = await api.get('/media/random-image');
            setBackgroundUrl(`${apiBase}${res.data.url}`);
        } catch (err) {
            console.error('Erreur chargement image d’accueil', err);
        }
    };

    // Config pour afficher ou non la section "actualités"
    const fetchConfig = async () => {
        try {
            const res = await api.get('/config/home');
            setShowNews(res.data.showNewsOnHome);
        } catch (err) {
            console.error('Erreur chargement config accueil', err);
        }
    };

    // Liste des actualités (affiche les 3 dernières)
    const fetchNews = async () => {
        try {
            const res = await api.get('/news');
            setNews(res.data);
        } catch (err) {
            console.error('Erreur chargement actualités', err);
        }
    };

    // On récupère tout au chargement de la page
    useEffect(() => {
        fetchRandomImage();
        fetchConfig();
        fetchNews();

        // Image de fond qui change toutes les 5s
        const interval = setInterval(fetchRandomImage, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            {/* SEO principal + open graph */}
            <SEO
                title="Tatoueur Nancy - Mystic Tattoo | Salon de tatouage artistique à Nancy 54000"
                description="Mystic Tattoo est le salon de tatouage incontournable à Nancy (54000). Artistes tatoueurs passionnés, galerie de tatouages, prise de rendez-vous en ligne, hygiène irréprochable, conseils personnalisés."
                url="https://www.mystic-tattoo.fr"
                image={backgroundUrl || 'https://www.mystic-tattoo.fr/default-cover.jpg'}
                keywords={SEO_KEYWORDS}
            />

            {/* Données structurées Schema.org pour Google (SEO local + pro) */}
            <script
                type="application/ld+json"
                // Injection du JSON-LD (attention : JSON.stringify pour React)
                dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
            />

            <div className={styles.home}>
                <h1 className={styles.home__title}>
                    Bienvenue chez Mystic Tattoo
                </h1>
                <p className={styles.home__subtitle}>
                    Tatouage artistique, styles variés, Découvrez nos créations à Nancy.
                </p>

                <div className={showNews ? styles.home__main : styles.home__singleColumn}>
                    <div className={showNews ? styles.home__hero : styles.home__heroFull}>
                        <div
                            className={styles.home__heroBg}
                            style={{ backgroundImage: `url('${backgroundUrl}')` }}
                        ></div>
                    </div>

                    {showNews && (
                        <section className={styles.home__content}>
                            <h2>Actualités du salon de tatouage Mystic Tattoo à Nancy</h2>
                            {news.length === 0 ? (
                                <p>Aucune actualité pour le moment.</p>
                            ) : (
                                <ul className={styles.home__newsList}>
                                    {news.slice(-3).reverse().map(item => (
                                        <li key={item.id} className={styles.home__newsItem}>
                                            <strong>{item.title}</strong>
                                            {item.image && (
                                                <img
                                                    src={`${apiBase}${item.image}`}
                                                    alt={`Actualité Mystic Tattoo : ${item.title} | Tatouage Nancy`}
                                                />
                                            )}
                                            <p>{item.content.slice(0, 100)}...</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Home;
