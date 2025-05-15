import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './Home.module.scss';
import api, { apiBase } from "../lib/api";
import SEO from '../components/SEO'; // ← IMPORT SEO

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [news, setNews] = useState([]);
    const [showNews, setShowNews] = useState(true);

    const fetchRandomImage = async () => {
        try {
            const res = await api.get('/media/random-image');
            setBackgroundUrl(`${apiBase}${res.data.url}`);
        } catch (err) {
            console.error('Erreur chargement image d’accueil', err);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await api.get('/config/home');
            setShowNews(res.data.showNewsOnHome);
        } catch (err) {
            console.error('Erreur chargement config accueil', err);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await api.get('/news');
            setNews(res.data);
        } catch (err) {
            console.error('Erreur chargement actualités', err);
        }
    };

    useEffect(() => {
        fetchRandomImage();
        fetchConfig();
        fetchNews();

        const interval = setInterval(fetchRandomImage, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            <SEO
                title="Mystic Tattoo - Salon de tatouage à Nancy 54000"
                description="Bienvenue chez Mystic Tattoo, votre salon de tatouage à Nancy. Artistes passionnés, prise de rendez-vous en ligne, galerie d’inspirations. Découvrez notre univers."
                url="https://www.mystic-tattoo.fr"
                image={backgroundUrl || 'https://www.mystic-tattoo.fr/default-cover.jpg'}
            />
            <div className={styles.home}>
                <h2 className={styles.home__title}>Bienvenue chez Mystic Tattoo</h2>

                <div className={showNews ? styles.home__main : styles.home__singleColumn}>
                    <div className={showNews ? styles.home__hero : styles.home__heroFull}>
                        <div
                            className={styles.home__heroBg}
                            style={{ backgroundImage: `url('${backgroundUrl}')` }}
                        ></div>
                    </div>

                    {showNews && (
                        <section className={styles.home__content}>
                            <h3>Actualités</h3>
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
                                                    alt={item.title}
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
