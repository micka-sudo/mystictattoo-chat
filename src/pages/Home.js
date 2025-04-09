// src/pages/Home.js
import React from 'react';
import './Home.scss';

const Home = () => {
    return (
        <div className="home">
            <div
                className="home__hero"
                style={{
                    backgroundImage: "url('/images/hero-background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="home__hero-overlay">
                    <h2>Bienvenue chez Mystic Tattoo</h2>
                </div>
            </div>

            <section className="home__content">
                <p>Contenu de présentation ici.</p>
            </section>
        </div>
    );
};

export default Home;
