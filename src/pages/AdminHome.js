import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import styles from './AdminHome.module.scss';
import api from '../lib/api'; // Appels backend centralisés via axios

const AdminHome = () => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
                setNews(res.data);
            } catch (error) {
                console.error('Erreur chargement actus admin', error);
            }
        };

        fetchNews();
    }, []);

    return (
        <Layout>
            <div className={styles.adminHome}>
                <h2>Espace Administrateur</h2>
                <p>Bienvenue dans l&apos;interface d&apos;administration de Mystic Tattoo.</p>

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
                                        src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${item.image}`}
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
