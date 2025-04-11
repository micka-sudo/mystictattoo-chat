import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import Layout from '../layouts/Layout';
import styles from './AdminUpload.module.scss';

const categories = ['oldschool', 'realiste', 'tribal', 'japonais', 'graphique', 'minimaliste'];

const AdminUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState('');

    const [media, setMedia] = useState([]);
    const [news, setNews] = useState([]);
    const [newItem, setNewItem] = useState({ title: '', content: '' });
    const [editId, setEditId] = useState(null);
    const [editItem, setEditItem] = useState({ title: '', content: '' });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [visibleCategories, setVisibleCategories] = useState(() => Object.fromEntries(categories.map(c => [c, false])));

    useEffect(() => {
        fetch('http://localhost:4000/api/media')
            .then((res) => res.json())
            .then((data) => setMedia(data));

        fetch('http://localhost:4000/api/news')
            .then(res => res.json())
            .then(setNews);
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
        if (!file || !category) {
            alert('Fichier et catégorie requis.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('tags', tags);

        setStatus('⏳ Upload en cours...');

        try {
            const res = await fetch('http://localhost:4000/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                setStatus(`✅ Upload réussi : ${result.filename}`);
                setFile(null);
                setPreview('');
                setCategory('');
                setTags('');
                setMedia([...media, result]);
            } else {
                setStatus(`❌ Échec : ${result.error || 'Erreur inconnue'}`);
            }
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
            formData.append('tags', '');

            const res = await fetch('http://localhost:4000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await res.json();
            if (res.ok) {
                imageUrl = `/uploads/${result.filename}`;
            } else {
                return alert('Erreur upload image actu');
            }
        }

        const res = await fetch('http://localhost:4000/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newItem, image: imageUrl })
        });

        if (res.ok) {
            const added = await res.json();
            setNews([...news, added]);
            setNewItem({ title: '', content: '' });
            setImageFile(null);
            setImagePreview('');
        }
    };

    const mediaByCategory = categories.reduce((acc, cat) => {
        acc[cat] = media.filter(m => m.category === cat);
        return acc;
    }, {});

    const toggleSelectAll = (cat) => {
        const allIds = mediaByCategory[cat].map(m => m.file);
        const isAllSelected = allIds.every(id => selectedMedia.includes(id));
        if (isAllSelected) {
            setSelectedMedia(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setSelectedMedia(prev => [...new Set([...prev, ...allIds])]);
        }
    };

    const toggleMediaSelection = (file) => {
        setSelectedMedia(prev => prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]);
    };

    const deleteSelectedMedia = async () => {
        if (!window.confirm('Supprimer les fichiers sélectionnés ?')) return;
        const deletedFiles = [];
        for (const file of selectedMedia) {
            const item = media.find(m => m.file === file);
            const res = await fetch('http://localhost:4000/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: item.file, category: item.category })
            });
            if (res.ok) deletedFiles.push(file);
        }
        setMedia(prev => prev.filter(m => !deletedFiles.includes(m.file)));
        setSelectedMedia([]);
    };

    const toggleAllCategories = () => {
        const allVisible = Object.values(visibleCategories).every(Boolean);
        const newState = Object.fromEntries(categories.map(c => [c, !allVisible]));
        setVisibleCategories(newState);
    };

    return (
        <Layout>
            <div className={styles.adminUpload}>
                <h2>📤 Ajouter un média</h2>
                <form onSubmit={handleUpload}>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        <option value="">-- Choisir une catégorie --</option>
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Tags (séparés par des virgules)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                    <button type="submit">Envoyer</button>
                </form>
                {preview && <div className={styles.preview}><img src={preview} alt="preview" /></div>}
                <p className={styles.status}>{status}</p>

                <div className={styles.newsSection}>
                    <h2>📰 Actualités</h2>
                    <form onSubmit={handleNewsSubmit}>
                        <input placeholder="Titre" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} required />
                        <textarea placeholder="Contenu" value={newItem.content} onChange={(e) => setNewItem({ ...newItem, content: e.target.value })} required />
                        <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }} />
                        {imagePreview && <div className={styles.preview}><img src={imagePreview} alt="preview actu" /></div>}
                        <button type="submit">➕ Ajouter</button>
                    </form>

                    <ul>
                        {news.map(item => (
                            <li key={item.id} className={styles.newsItem}>
                                <strong>{item.title}</strong>
                                {item.image && <img src={`http://localhost:4000${item.image}`} alt={item.title} />}
                                <p>{item.content}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <h2>🖼 Médias <button onClick={toggleAllCategories}>Afficher/Masquer tout</button></h2>
                {categories.map((cat) => (
                    <div key={cat} className={styles.mediaCategory}>
                        <div className={styles.categoryHeader}>
                            <div onClick={() => setVisibleCategories(prev => ({ ...prev, [cat]: !prev[cat] }))}>
                                {visibleCategories[cat] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                <h3>{cat}</h3>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={mediaByCategory[cat].every(m => selectedMedia.includes(m.file))}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            toggleSelectAll(cat);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    /> Sélectionner tout
                                </label>
                                <button
                                    className={styles.trashBtn}
                                    title={`Supprimer tous les médias de ${cat}`}
                                    onClick={() => {
                                        const filesToDelete = mediaByCategory[cat].map(m => m.file);
                                        setSelectedMedia(filesToDelete);
                                        deleteSelectedMedia();
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.categoryContent} style={{
                            maxHeight: visibleCategories[cat] ? '1000px' : '0px',
                            overflow: 'hidden',
                            transition: 'max-height 0.5s ease-in-out'
                        }}>
                            <div className={styles.mediaGrid}>
                                {mediaByCategory[cat].map((item, idx) => (
                                    <div key={idx} className={styles.mediaItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedMedia.includes(item.file)}
                                            onChange={() => toggleMediaSelection(item.file)}
                                        />
                                        {item.type === 'image' ? (
                                            <img src={`http://localhost:4000${item.url}`} alt={item.file} />
                                        ) : (
                                            <video src={`http://localhost:4000${item.url}`} controls />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {selectedMedia.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button onClick={deleteSelectedMedia} className={styles.deleteButton}>🗑 Supprimer les fichiers sélectionnés</button>
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
