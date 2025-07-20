import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './AdminDashboard.module.scss';
import api, { apiBase } from '../lib/api';

const AdminDashboard = () => {
    const [media, setMedia] = useState([]);
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState('');
    const [filter, setFilter] = useState('all');
    const [moveToCategory, setMoveToCategory] = useState('');
    const [categories, setCategories] = useState([]);

    const [news, setNews] = useState([]);
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsImage, setNewsImage] = useState(null);

    // Chargement au montage
    useEffect(() => {
        fetchMedia();
        fetchNews();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await api.get('/media');
            setMedia(res.data);
            const cats = Array.from(new Set(res.data.map(m => m.category)));
            setCategories(cats);
        } catch (err) {
            console.error('Erreur chargement médias', err);
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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !category) return alert('Fichier et catégorie requis');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        try {
            const res = await api.post('/media/upload', formData);
            setMedia([...media, res.data]);
            setFile(null);
            setCategory('');
        } catch (err) {
            console.error('Erreur upload', err);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Supprimer ${item.filename} ?`)) return;
        try {
            await api.delete(`/media/${item._id}`);
            setMedia(media.filter(m => m._id !== item._id));
        } catch (err) {
            console.error('Erreur suppression', err);
        }
    };

    const handleMove = async (item) => {
        if (!moveToCategory || moveToCategory === item.category) return;

        try {
            const res = await api.put(`/media/${item._id}/move`, {
                newCategory: moveToCategory
            });

            const updated = res.data;
            setMedia(media.map(m => m._id === updated._id ? updated : m));
            setMoveToCategory('');
        } catch (err) {
            console.error('Erreur déplacement', err);
        }
    };

    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        if (!newsTitle || !newsContent) return alert('Titre et contenu requis');

        const formData = new FormData();
        formData.append('title', newsTitle);
        formData.append('content', newsContent);
        if (newsImage) formData.append('image', newsImage);

        try {
            const res = await api.post('/news', formData);
            setNews([res.data, ...news]);
            setNewsTitle('');
            setNewsContent('');
            setNewsImage(null);
        } catch (err) {
            console.error('Erreur ajout actu', err);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm('Supprimer cette actualité ?')) return;
        try {
            await api.delete(`/news/${id}`);
            setNews(news.filter(n => n._id !== id));
        } catch (err) {
            console.error('Erreur suppression actu', err);
        }
    };

    const filteredMedia = filter === 'all'
        ? media
        : media.filter(m => m.category === filter);

    return (
        <Layout>
            <div className={styles.adminDashboard}>
                <h2>🎛 Tableau de bord</h2>

                {/* ===================== ACTUALITÉS ===================== */}
                <section className={styles.newsSection}>
                    <h3>📰 Gérer les actualités</h3>
                    <form onSubmit={handleNewsSubmit} className={styles.uploadForm}>
                        <input
                            type="text"
                            placeholder="Titre"
                            value={newsTitle}
                            onChange={(e) => setNewsTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Contenu"
                            rows="3"
                            value={newsContent}
                            onChange={(e) => setNewsContent(e.target.value)}
                            required
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewsImage(e.target.files[0])}
                        />
                        <button type="submit">➕ Ajouter l’actualité</button>
                    </form>

                    <div className={styles.mediaGrid}>
                        {news.map((item) => (
                            <div key={item._id} className={styles.mediaItem}>
                                <strong>{item.title}</strong>
                                {item.image && (
                                    <img src={`${apiBase}${item.image}`} alt={item.title} />
                                )}
                                <p>{item.content.slice(0, 100)}…</p>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteNews(item._id)}
                                >
                                    🗑 Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===================== MÉDIAS ===================== */}
                <section>
                    <h3>🖼 Gérer les médias</h3>

                    <form onSubmit={handleUpload} className={styles.uploadForm}>
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                        <input
                            type="text"
                            placeholder="Catégorie (ex: realiste)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                        <button type="submit">➕ Ajouter</button>
                    </form>

                    <div className={styles.filterBar}>
                        <label>Filtrer :</label>
                        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                            <option value="all">Toutes</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.mediaGrid}>
                        {filteredMedia.map((item) => (
                            <div key={item._id} className={styles.mediaItem}>
                                {item.type === 'image' ? (
                                    <img src={`${apiBase}${item.path}`} alt={item.filename} />
                                ) : (
                                    <video src={`${apiBase}${item.path}`} controls />
                                )}
                                <div className={styles.meta}>
                                    <strong>{item.filename}</strong>
                                    <span className={styles.badge}>{item.category}</span>
                                </div>
                                <div className={styles.moveSection}>
                                    <select
                                        value={moveToCategory}
                                        onChange={(e) => setMoveToCategory(e.target.value)}
                                    >
                                        <option value="">Déplacer vers…</option>
                                        {categories
                                            .filter(c => c !== item.category)
                                            .map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                    </select>
                                    <button onClick={() => handleMove(item)}>📦 Déplacer</button>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(item)}>
                                    🗑 Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
