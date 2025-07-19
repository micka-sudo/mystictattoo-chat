import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import styles from './AdminHome.module.scss';
import api, { apiBase } from '../lib/api';

const AdminHome = () => {
    const [news, setNews] = useState([]);

    const fetchNews = async () => {
        try {
            const res = await api.get('/news');
            setNews(res.data);
        } catch (error) {
            console.error('Erreur chargement actus admin', error);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // 🔁 Supprimer une actu
    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette actualité ?')) return;

        try {
            await api.delete(`/news/${id}`);
            setNews(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Erreur suppression actu', error);
            alert("Erreur lors de la suppression.");
        }
    };

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
                                        src={`${apiBase}${item.image}`}
                                        alt="illustration actu"
                                        width="150"
                                    />
                                )}
                                <p>{item.content}</p>

                                {/* 🔴 Bouton supprimer */}
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className={styles.deleteBtn}
                                >
                                    ❌ Supprimer
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </Layout>
    );
};

export default AdminHome;
