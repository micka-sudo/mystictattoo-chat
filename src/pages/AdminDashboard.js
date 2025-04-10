import React, { useEffect, useState } from 'react';
import './AdminDashboard.scss';

const AdminDashboard = () => {
    const [media, setMedia] = useState([]);
    const [filter, setFilter] = useState('all');
    const [tags, setTags] = useState({});

    useEffect(() => {
        fetch('http://localhost:4000/api/media')
            .then((res) => res.json())
            .then((data) => {
                setMedia(data);
                setTags(
                    data.reduce((acc, item) => {
                        acc[item.file] = item.tags || [];
                        return acc;
                    }, {})
                );
            })
            .catch((err) => console.error('Erreur chargement médias', err));
    }, []);

    const filteredMedia = filter === 'all'
        ? media
        : media.filter((m) => m.category === filter);

    const categories = Array.from(new Set(media.map((m) => m.category)));

    const handleDelete = async (item) => {
        const confirm = window.confirm(`Supprimer ${item.file} ?`);
        if (!confirm) return;

        try {
            const res = await fetch('http://localhost:4000/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: item.file, category: item.category }),
            });

            if (res.ok) {
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
        <div className="admin-dashboard">
            <h2>Tableau de bord des médias</h2>

            <div className="filter-bar">
                <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                    <option value="all">Toutes les catégories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="media-grid">
                {filteredMedia.map((item, idx) => (
                    <div key={idx} className="media-item">
                        {item.type === 'image' ? (
                            <img src={`http://localhost:4000${item.url}`} alt={item.file} />
                        ) : (
                            <video src={`http://localhost:4000${item.url}`} controls />
                        )}
                        <div className="media-info">
                            <p>{item.file}</p>
                            <span className="badge">{item.category}</span>
                        </div>

                        {/* ✅ Liste des tags */}
                        <div className="tag-list">
                            {(tags[item.file] || []).map((tag, i) => (
                                <span key={i} className="tag">
                  {tag}
                                    <button onClick={() => removeTag(item.file, tag)}>×</button>
                </span>
                            ))}
                        </div>

                        {/* ✅ Ajout de tags */}
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

                        {/* ✅ Bouton Supprimer */}
                        <button
                            className="delete-btn"
                            onClick={() => handleDelete(item)}
                        >
                            🗑 Supprimer
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
