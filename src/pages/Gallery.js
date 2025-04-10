import React, { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import AnimatedSection from '../components/AnimatedSection';
import { useLocation } from 'react-router-dom'; // Ajout de useLocation
import './Gallery.scss';

const Gallery = () => {
    const [media, setMedia] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const imageRef = useRef(null);
    const location = useLocation(); // Accède à l'URL

    // ✅ Chargement dynamique des fichiers depuis l'API
    useEffect(() => {
        fetch('http://localhost:4000/api/media')
            .then((res) => res.json())
            .then((data) => setMedia(data))
            .catch((err) => console.error('Erreur chargement galerie :', err));
    }, []);

    // ✅ Charger la catégorie depuis l'URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const categoryFromUrl = queryParams.get('style') || 'all';
        setActiveCategory(categoryFromUrl);
    }, [location]);

    // ✅ Liste dynamique des catégories
    const categories = ['all', ...new Set(media.map((item) => item.category))];

    // ✅ Filtrage selon la catégorie active
    const filteredMedia = activeCategory === 'all'
        ? media
        : media.filter((item) => item.category === activeCategory);

    // ✅ Blocage du scroll quand zoom
    useEffect(() => {
        document.body.style.overflow = selectedMedia ? 'hidden' : 'auto';
    }, [selectedMedia]);

    // ✅ Fermeture par touche Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') setSelectedMedia(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const handleOverlayClick = (e) => {
        if (imageRef.current && !imageRef.current.contains(e.target)) {
            setSelectedMedia(null);
        }
    };

    return (
        <>
            <SEO
                title="Galerie - Mystic Tattoo"
                description="Découvrez notre galerie classée par styles de tatouage."
                url="https://votre-domaine.com/gallery"
            />

            <div className="gallery">
                <AnimatedSection>
                    <h2>Galerie</h2>

                    <div className="gallery__categories">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`gallery__category-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat === 'all' ? 'Toutes' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="gallery__grid">
                        {filteredMedia.map((item, idx) => (
                            <AnimatedSection key={idx} delay={0.1 * idx}>
                                <div
                                    className="gallery__item"
                                    onClick={() => setSelectedMedia(`http://localhost:4000${item.url}`)}
                                >
                                    {item.type === 'video' ? (
                                        <video
                                            src={`http://localhost:4000${item.url}`}
                                            muted
                                            loop
                                            autoPlay
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={`http://localhost:4000${item.url}`}
                                            alt={item.file}
                                        />
                                    )}
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </AnimatedSection>

                {selectedMedia && (
                    <div className="gallery__overlay" onClick={handleOverlayClick}>
                        {selectedMedia.endsWith('.mp4') || selectedMedia.endsWith('.webm') ? (
                            <video
                                ref={imageRef}
                                src={selectedMedia}
                                autoPlay
                                loop
                                muted
                                controls
                                style={{ maxWidth: '70vw', maxHeight: '70vh', borderRadius: '8px' }}
                            />
                        ) : (
                            <img
                                ref={imageRef}
                                src={selectedMedia}
                                alt="Tatouage zoomé"
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Gallery;
