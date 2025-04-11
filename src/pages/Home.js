import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './Home.module.scss';

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState('');

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
                        <h3>Actualités</h3>
                        <p>📢 Les dernières news seront affichées ici depuis le panneau d’admin !</p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
