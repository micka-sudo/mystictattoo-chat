import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout'; // ✅ Layout global
import styles from './AdminHome.module.scss'; // ✅ SCSS module

const AdminHome = () => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/api/news')
            .then(res => res.json())
            .then(setNews)
            .catch(err => console.error('Erreur chargement actus admin', err));
    }, []);

    return (
        <Layout>
            <div className={styles.adminHome}>
                <h2>Espace Administrateur</h2>
                <p>Bienvenue dans l'interface d'administration de Mystic Tattoo.</p>

                <div className={styles.adminHome__links}>
                    <Link to="/admin/login" className={styles.adminBtn}>Connexion</Link>
                    <Link to="/admin" className={styles.adminBtn}>Upload</Link>
                    <Link to="/admin/dashboard" className={styles.adminBtn}>Médias</Link>
                </div>

                <section className={styles.newsSection}>
                    <h3>📰 Dernières actualités</h3>
                    {news.length === 0 && <p>Aucune actualité pour le moment.</p>}
                    <ul>
                        {news.slice().reverse().map((item) => (
                            <li key={item.id}>
                                <strong>{item.title}</strong>
                                {item.image && (
                                    <img
                                        src={`http://localhost:4000${item.image}`}
                                        alt="illustration actu"
                                        width="150"
                                    />
                                )}
                                <p>{item.content}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </Layout>
    );
};

export default AdminHome;
