import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './AdminDashboard.module.scss';
import api, { apiBase } from '../lib/api';

const AdminDashboard = () => {
    const [media, setMedia] = useState([]);
    const [filter, setFilter] = useState('all');
    const [tags, setTags] = useState({});
    const [news, setNews] = useState([]);
    const [newItem, setNewItem] = useState({ title: '', content: '' });
    const [editId, setEditId] = useState(null);
    const [editItem, setEditItem] = useState({ title: '', content: '' });

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await api.get('/media');
                setMedia(res.data);
                setTags(
                    res.data.reduce((acc, item) => {
                        acc[item.file] = item.tags || [];
                        return acc;
                    }, {})
                );
            } catch (err) {
                console.error('Erreur chargement médias', err);
            }
        };
        fetchMedia();
    }, []);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
                setNews(res.data);
            } catch (err) {
                console.error('Erreur chargement actualités', err);
            }
        };
        fetchNews();
    }, []);

    const filteredMedia = filter === 'all'
        ? media
        : media.filter((m) => m.category === filter);

    const categories = Array.from(new Set(media.map((m) => m.category)));

    const handleDelete = async (item) => {
        if (!window.confirm(`Supprimer ${item.file} ?`)) return;

        try {
            const res = await api.delete('/media', {
                data: { file: item.file, category: item.category }
            });

            if (res.status === 200) {
                setMedia(media.filter((m) => m.file !== item.file));
                setTags((prev) => {
                    const updated = { ...prev };
                    delete updated[item.file];
                    return updated;
                });
            } else {
                alert('Erreur lors de la suppression du fichier');
            }
        } catch (err) {
            console.error('Erreur serveur :', err);
        }
    };

    const addTag = (file, newTag) => {
        if (!newTag.trim()) return;
        setTags((prev) => ({
            ...prev,
            [file]: [...(prev[file] || []), newTag.trim()]
        }));
    };

    const removeTag = (file, tagToRemove) => {
        setTags((prev) => ({
            ...prev,
            [file]: prev[file].filter((t) => t !== tagToRemove)
        }));
    };

    return (
        <Layout>
            <div className={styles.adminDashboard}>
                <h2>Tableau de bord des médias</h2>

                <div className={styles.filterBar}>
                    <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                        <option value="all">Toutes les catégories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.mediaGrid}>
                    {filteredMedia.map((item, idx) => (
                        <div key={idx} className={styles.mediaItem}>
                            {item.type === 'image' ? (
                                <img src={`${apiBase}${item.url}`} alt={item.file} />
                            ) : (
                                <video src={`${apiBase}${item.url}`} controls />
                            )}

                            <div className={styles.mediaInfo}>
                                <p>{item.file}</p>
                                <span className={styles.badge}>{item.category}</span>
                            </div>

                            <div className={styles.tagList}>
                                {(tags[item.file] || []).map((tag, i) => (
                                    <span key={i} className={styles.tag}>
                                        {tag}
                                        <button onClick={() => removeTag(item.file, tag)}>×</button>
                                    </span>
                                ))}
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const value = e.target.elements[`tag-${idx}`].value;
                                    addTag(item.file, value);
                                    e.target.reset();
                                }}
                            >
                                <input name={`tag-${idx}`} placeholder="Ajouter un tag" />
                                <button type="submit">+ Ajouter</button>
                            </form>

                            <button className={styles.deleteBtn} onClick={() => handleDelete(item)}>
                                🗑 Supprimer
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.newsSection}>
                    <h2>Actualités</h2>

                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await api.post('/news', newItem);
                        if (res.status === 201 || res.status === 200) {
                            setNews([...news, res.data]);
                            setNewItem({ title: '', content: '' });
                        }
                    }}>
                        <input
                            placeholder="Titre"
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Contenu"
                            value={newItem.content}
                            onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                        />
                        <button type="submit">➕ Ajouter</button>
                    </form>

                    <ul>
                        {news.map(item => (
                            <li key={item.id} className={styles.newsItem}>
                                {editId === item.id ? (
                                    <>
                                        <input
                                            value={editItem.title}
                                            onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                                        />
                                        <textarea
                                            value={editItem.content}
                                            onChange={(e) => setEditItem({ ...editItem, content: e.target.value })}
                                        />
                                        <button onClick={async () => {
                                            const res = await api.put(`/news/${item.id}`, editItem);
                                            if (res.status === 200) {
                                                const updated = res.data;
                                                setNews(news.map(n => n.id === updated.id ? updated : n));
                                                setEditId(null);
                                                setEditItem({ title: '', content: '' });
                                            }
                                        }}>💾 Sauver</button>
                                        <button onClick={() => setEditId(null)}>❌ Annuler</button>
                                    </>
                                ) : (
                                    <>
                                        <strong>{item.title}</strong>
                                        <p>{item.content}</p>
                                        <button onClick={() => {
                                            setEditId(item.id);
                                            setEditItem({ title: item.title, content: item.content });
                                        }}>✏️ Modifier</button>
                                        <button onClick={async () => {
                                            await api.delete(`/news/${item.id}`);
                                            setNews(news.filter(n => n.id !== item.id));
                                        }}>🗑 Supprimer</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
