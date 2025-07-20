import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './AdminDashboard.module.scss';
import api, { apiBase } from '../lib/api';

const AdminDashboard = () => {
    const [media, setMedia] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [filter, setFilter] = useState('all');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchMedia();
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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || (!selectedCategory && !customCategory)) {
            return alert('Veuillez sélectionner ou saisir une catégorie');
        }

        const category = customCategory.trim() || selectedCategory;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        try {
            const res = await api.post('/media/upload', formData);
            setMedia([...media, res.data]);
            if (!categories.includes(category)) {
                setCategories([...categories, category]);
            }
            setFile(null);
            setSelectedCategory('');
            setCustomCategory('');
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

    const handleMove = async (item, newCategory) => {
        if (!newCategory || newCategory === item.category) return;

        try {
            const res = await api.patch(`/media/${item._id}/move`, {
                newCategory
            });

            const updated = res.data.media;
            setMedia(media.map(m => m._id === updated._id ? updated : m));
            if (!categories.includes(newCategory)) {
                setCategories([...categories, newCategory]);
            }
        } catch (err) {
            console.error('Erreur déplacement', err);
        }
    };

    const filteredMedia = filter === 'all'
        ? media
        : media.filter(m => m.category === filter);

    return (
        <Layout>
            <div className={styles.adminDashboard}>
                <h2>🎛 Tableau de bord des médias</h2>

                {/* 📤 Upload fichier */}
                <form onSubmit={handleUpload} className={styles.uploadForm}>
                    <h3>Ajouter un média</h3>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                    />

                    {/* Sélecteur de catégorie existante */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Choisir une catégorie existante</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>

                    <p style={{ textAlign: 'center' }}>ou</p>

                    {/* Champ de nouvelle catégorie */}
                    <input
                        type="text"
                        placeholder="Créer une nouvelle catégorie"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                    />

                    <button type="submit">➕ Ajouter</button>
                </form>

                {/* 🔍 Filtrage */}
                <div className={styles.filterBar}>
                    <label>Filtrer :</label>
                    <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                        <option value="all">Toutes</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 🖼 Galerie admin */}
                <div className={styles.mediaGrid}>
                    {filteredMedia.map((item) => (
                        <div key={item._id} className={styles.mediaItem}>
                            {item.type === 'image' ? (
                                <img src={`${apiBase}${item.path}`} alt={item.filename} />
                            ) : (
                                <video src={`${apiBase}${item.path}`} controls />
                            )}

                            <div className={styles.mediaInfo}>
                                <span className={styles.badge}>{item.category}</span>
                            </div>

                            {/* Déplacement vers une autre catégorie */}
                            <div className={styles.moveSection}>
                                <select
                                    defaultValue=""
                                    onChange={(e) => handleMove(item, e.target.value)}
                                >
                                    <option value="">Déplacer vers…</option>
                                    {categories
                                        .filter((c) => c !== item.category)
                                        .map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Suppression */}
                            <button
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(item)}
                            >
                                🗑 Supprimer
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
