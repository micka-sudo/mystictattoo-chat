import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './Home.module.scss';
import api from '../lib/api';

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [news, setNews] = useState([]);

    // ✅ Récupérer une image aléatoire toutes les 5 secondes
    const fetchRandomImage = async () => {
        try {
            const res = await api.get('/media/random-image');
            setBackgroundUrl(`${process.env.REACT_APP_API_URL.replace('/api', '')}${res.data.url}`);
        } catch (err) {
            console.error('Erreur chargement image d’accueil', err);
        }
    };

    // 🔁 Lancer l'image aléatoire
    useEffect(() => {
        fetchRandomImage();
        const interval = setInterval(fetchRandomImage, 5000);
        return () => clearInterval(interval);
    }, []);

    // ✅ Charger actualités
    useEffect(() => {
        api.get('/news')
            .then(res => setNews(res.data))
            .catch(err => console.error('Erreur chargement actualités', err));
    }, []);

    return (
        <Layout>
            <div className={styles.home}>
                <h2 className={styles.home__title}>Bienvenue chez Mystic Tattoo</h2>

                <div className={styles.home__main}>
                    <div className={styles.home__hero}>
                        <div
                            className={styles.home__heroBg}
                            style={{ backgroundImage: `url('${backgroundUrl}')` }}
                        ></div>
                    </div>

                    <section className={styles.home__content}>
                        <h3>📰 Actualités</h3>
                        {news.length === 0 ? (
                            <p>Aucune actualité pour le moment.</p>
                        ) : (
                            <ul className={styles.home__newsList}>
                                {news.slice(-3).reverse().map(item => (
                                    <li key={item.id} className={styles.home__newsItem}>
                                        <strong>{item.title}</strong>
                                        {item.image && (
                                            <img
                                                src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${item.image}`}
                                                alt={item.title}
                                            />
                                        )}
                                        <p>{item.content.slice(0, 100)}...</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
