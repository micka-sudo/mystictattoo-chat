import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import styles from './AdminUpload.module.scss';

const categories = ['oldschool', 'realiste', 'tribal', 'japonais', 'graphique', 'minimaliste'];

const AdminUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState('');

    const [news, setNews] = useState([]);
    const [newItem, setNewItem] = useState({ title: '', content: '' });
    const [editId, setEditId] = useState(null);
    const [editItem, setEditItem] = useState({ title: '', content: '' });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Charger les actualités au montage
    useEffect(() => {
        fetch('http://localhost:4000/api/news')
            .then(res => res.json())
            .then(setNews)
            .catch(err => console.error('Erreur chargement actualités', err));
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setStatus('');
    };

    const handleSubmit = async (e) => {
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
            } else {
                setStatus(`❌ Échec : ${result.error || 'Erreur inconnue'}`);
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Erreur lors de l’upload');
        }
    };

    return (
        <Layout>
            <div className={styles.adminUpload}>
                <h2>Upload Média</h2>

                <form onSubmit={handleSubmit}>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} />

                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        <option value="">-- Choisir une catégorie --</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Tags (séparés par des virgules)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />

                    <button type="submit">Envoyer</button>
                </form>

                {preview && (
                    <div className={styles.preview}>
                        <h4>Aperçu :</h4>
                        {file?.type?.startsWith('video') ? (
                            <video src={preview} controls width="300" />
                        ) : (
                            <img src={preview} alt="preview" width="300" />
                        )}
                    </div>
                )}

                <p className={styles.status}>{status}</p>

                <hr />

                <div className={styles.newsSection}>
                    <h2>Actualités</h2>

                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            let imageUrl = '';

                            if (imageFile) {
                                const formData = new FormData();
                                formData.append('file', imageFile);
                                formData.append('category', 'actus');
                                formData.append('tags', '');

                                try {
                                    const uploadRes = await fetch('http://localhost:4000/api/upload', {
                                        method: 'POST',
                                        body: formData,
                                    });

                                    const uploadData = await uploadRes.json();
                                    if (uploadRes.ok) {
                                        imageUrl = `/uploads/${uploadData.filename}`;
                                    } else {
                                        alert('Erreur upload image : ' + uploadData.error);
                                        return;
                                    }
                                } catch (err) {
                                    console.error('Erreur upload image', err);
                                    return;
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
                        }}
                    >
                        <input
                            placeholder="Titre"
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Contenu"
                            value={newItem.content}
                            onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                            required
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
                        {imagePreview && (
                            <div className={styles.preview}>
                                <img src={imagePreview} alt="Aperçu actu" width="200" />
                            </div>
                        )}
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
                                            const res = await fetch(`http://localhost:4000/api/news/${item.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(editItem)
                                            });
                                            if (res.ok) {
                                                const updated = await res.json();
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
                                        {item.image && (
                                            <img
                                                src={`http://localhost:4000${item.image}`}
                                                alt="illustration actu"
                                                width="200"
                                            />
                                        )}
                                        <p>{item.content}</p>
                                        <button onClick={() => {
                                            setEditId(item.id);
                                            setEditItem({ title: item.title, content: item.content });
                                        }}>✏️ Modifier</button>
                                        <button onClick={async () => {
                                            await fetch(`http://localhost:4000/api/news/${item.id}`, {
                                                method: 'DELETE'
                                            });
                                            setNews(news.filter(n => n.id !== item.id));
                                        }}>🗑 Supprimer</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.adminUpload__links}>
                    <p>📁 Voir tous les médias ?</p>
                    <Link to="/admin/dashboard" className={styles.adminBtn}>Tableau de bord</Link>
                </div>
            </div>
        </Layout>
    );
};

export default AdminUpload;
