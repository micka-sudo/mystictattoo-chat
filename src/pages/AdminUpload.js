import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import styles from './AdminUpload.module.scss';
import api, { apiBase } from '../lib/api';

const AdminUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [category, setCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState('');
    const [categories, setCategories] = useState([]);

    const [media, setMedia] = useState([]);
    const [news, setNews] = useState([]);
    const [newItem, setNewItem] = useState({ title: '', content: '', image: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [showMediaForm, setShowMediaForm] = useState(false);
    const [showNewsForm, setShowNewsForm] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState('');

    const fetchData = async () => {
        const [mediaRes, newsRes, catRes] = await Promise.all([
            api.get('/media'),
            api.get('/news'),
            api.get('/media/categories')
        ]);
        setMedia(mediaRes.data);
        setNews(newsRes.data);
        setCategories(catRes.data.filter(c => c !== 'actus'));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setStatus('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const finalCategory = newCategory || category;
        if (!file || !finalCategory) return alert('Fichier et catégorie requis.');

        if (newCategory && !categories.includes(newCategory)) {
            try {
                await api.post('/media/category', { name: newCategory });
                await fetchData(); // refresh
            } catch (err) {
                console.error('Erreur création catégorie', err);
                setStatus('❌ Erreur création catégorie');
                return;
            }
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', finalCategory);
        formData.append('tags', tags);

        setStatus('⏳ Upload en cours...');
        try {
            const res = await api.post('/upload', formData);
            setMedia(prev => [...prev, res.data]);
            setStatus(`✅ Upload réussi : ${res.data.filename}`);
            setFile(null);
            setPreview('');
            setCategory('');
            setNewCategory('');
            setTags('');
            setShowMediaForm(false);
        } catch (err) {
            console.error(err);
            setStatus('❌ Erreur lors de l’upload');
        }
    };

    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        let imageUrl = '';

        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('category', 'actus');
            const resUpload = await api.post('/upload', formData);
            imageUrl = `/uploads/${resUpload.data.filename}`;
        }

        const res = await api.post('/news', {
            title: newItem.title,
            content: newItem.content,
            image: imageUrl
        });

        setNews([...news, res.data]);
        setNewItem({ title: '', content: '', image: '' });
        setImageFile(null);
        setImagePreview('');
        setShowNewsForm(false);
    };

    const deleteSelectedMedia = async () => {
        if (!window.confirm('Supprimer les fichiers sélectionnés ?')) return;

        const deletedFiles = [];
        for (const file of selectedMedia) {
            const item = media.find(m => m.file === file);
            const res = await api.delete('/media', {
                data: { file: item.file, category: item.category }
            });
            if (res.status === 200) deletedFiles.push(file);
        }

        setMedia(prev => prev.filter(m => !deletedFiles.includes(m.file)));
        setSelectedMedia([]);
        await fetchData();
    };

    const deleteCategory = async (cat) => {
        if (!window.confirm(`Supprimer la catégorie "${cat}" ?`)) return;
        try {
            await api.delete('/media/category', { data: { name: cat } });
            await fetchData();
            if (expandedCategory === cat) setExpandedCategory('');
        } catch (err) {
            alert('Erreur : cette catégorie n’est pas vide ou suppression impossible');
        }
    };

    const toggleMediaSelection = (file) => {
        setSelectedMedia(prev =>
            prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]
        );
    };

    const mediaByCategory = categories.reduce((acc, cat) => {
        acc[cat] = media.filter(m => m.category === cat);
        return acc;
    }, {});

    const toggleCategory = (cat) => {
        setExpandedCategory(prev => (prev === cat ? '' : cat));
    };

    return (
        <Layout>
            <div className={styles.adminUpload}>
                <h2>📤 Ajouter un média</h2>
                <button className={styles.adminBtn} onClick={() => setShowMediaForm(!showMediaForm)}>
                    {showMediaForm ? 'Fermer' : 'Ajouter un média'}
                </button>
                {showMediaForm && (
                    <form onSubmit={handleUpload}>
                        <input type="file" accept="image/*,video/*" onChange={handleFileChange} required />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">-- Choisir une catégorie --</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Ou créer une nouvelle catégorie"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Tags (séparés par des virgules)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                        <button type="submit" className={styles.adminBtn}>Envoyer</button>
                    </form>
                )}
                {preview && <div className={styles.preview}><img src={preview} alt="preview" /></div>}
                <p className={styles.status}>{status}</p>

                <h2>📰 Ajouter une actualité</h2>
                <button className={styles.adminBtn} onClick={() => setShowNewsForm(!showNewsForm)}>
                    {showNewsForm ? 'Fermer' : 'Ajouter une actu'}
                </button>
                {showNewsForm && (
                    <form onSubmit={handleNewsSubmit}>
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
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                        {imagePreview && <div className={styles.preview}><img src={imagePreview} alt="preview actu" /></div>}
                        <button type="submit" className={styles.adminBtn}>➕ Ajouter</button>
                    </form>
                )}

                <h2>🖼 Médias enregistrés</h2>
                {categories.map((cat) => (
                    <div key={cat} className={styles.mediaCategory}>
                        <h3 onClick={() => toggleCategory(cat)} style={{ cursor: 'pointer' }}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)} {expandedCategory === cat ? '🔽' : '▶'}
                        </h3>
                        <button className={styles.adminBtn} onClick={() => deleteCategory(cat)}>
                            Supprimer la catégorie
                        </button>
                        {expandedCategory === cat && (
                            <div className={styles.mediaGrid}>
                                {mediaByCategory[cat].map((item, idx) => (
                                    <div key={idx} className={styles.mediaItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedMedia.includes(item.file)}
                                            onChange={() => toggleMediaSelection(item.file)}
                                        />
                                        {item.type === 'image' ? (
                                            <img src={`${apiBase}${item.url}`} alt={item.file} />
                                        ) : (
                                            <video src={`${apiBase}${item.url}`} controls />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {selectedMedia.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button className={styles.adminBtn} onClick={deleteSelectedMedia}>
                            🗑 Supprimer les fichiers sélectionnés
                        </button>
                    </div>
                )}

                <div className={styles.adminUpload__links}>
                    <Link to="/admin/home" className={styles.adminBtn}>🏠 Accueil Admin</Link>
                </div>
            </div>
        </Layout>
    );
};

export default AdminUpload;
