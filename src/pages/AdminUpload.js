import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminUpload.scss';

const categories = ['oldschool', 'realiste', 'tribal', 'japonais', 'graphique', 'minimaliste'];

const AdminUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        const previewURL = URL.createObjectURL(selected);
        setPreview(previewURL);
        setFile(selected);
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
        <div className="admin-upload">
            <h2>Upload Admin</h2>
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
                <div className="preview">
                    <h4>Aperçu :</h4>
                    {file?.type?.startsWith('video') ? (
                        <video src={preview} controls width="300" />
                    ) : (
                        <img src={preview} alt="preview" width="300" />
                    )}
                </div>
            )}

            <p className="status">{status}</p>

            {/* ✅ Lien vers dashboard */}
            <div className="admin-upload__links">
                <p>📁 Vous voulez gérer les médias existants ?</p>
                <Link to="/admin/dashboard" className="admin-btn">Gérer les médias</Link>
            </div>
        </div>
    );
};

export default AdminUpload;
