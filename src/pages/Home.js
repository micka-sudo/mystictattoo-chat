import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './Home.module.scss';

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [news, setNews] = useState([]);

    // ✅ Image dynamique toutes les 5s
    const fetchRandomImage = () => {
        fetch('http://localhost:4000/api/media/random-image')
            .then(res => res.json())
            .then(data => {
                setBackgroundUrl(`http://localhost:4000${data.url}`);
            })
            .catch(err => console.error('Erreur chargement image d’accueil', err));
    };

    useEffect(() => {
        fetchRandomImage();
        const interval = setInterval(fetchRandomImage, 5000);
        return () => clearInterval(interval);
    }, []);

    // ✅ Charger actualités depuis API
    useEffect(() => {
        fetch('http://localhost:4000/api/news')
            .then(res => res.json())
            .then(setNews)
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
                                                src={`http://localhost:4000${item.image}`}
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
