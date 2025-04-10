import React, { useEffect, useState } from 'react';
import './Home.scss';

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState('');

    // Fonction pour récupérer une image aléatoire
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
        const interval = setInterval(fetchRandomImage, 5000); // Image change toutes les 5 secondes
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home">
            <h2 className="home__title">Bienvenue chez Mystic Tattoo</h2>

            <div className="home__main">
                <div
                    className="home__hero"
                    style={{ backgroundImage: `url('${backgroundUrl}')` }}
                ></div>

                <section className="home__content">
                    <h3>Actualités</h3>
                    <p>📢 Les dernières news seront affichées ici depuis le panneau d’admin !</p>
                </section>
            </div>
        </div>
    );
};

export default Home;
