import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import AnimatedSection from '../components/AnimatedSection';
import Layout from '../layouts/Layout';
import styles from './Gallery.module.scss'; // ✅ Styles modularisés

const Gallery = () => {
    const [media, setMedia] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const imageRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        fetch('http://localhost:4000/api/media')
            .then((res) => res.json())
            .then((data) => setMedia(data))
            .catch((err) => console.error('Erreur chargement galerie :', err));
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const categoryFromUrl = queryParams.get('style') || 'all';
        setActiveCategory(categoryFromUrl);
    }, [location]);

    const categories = ['all', ...new Set(media.map((item) => item.category))];

    const filteredMedia =
        activeCategory === 'all'
            ? media
            : media.filter((item) => item.category === activeCategory);

    useEffect(() => {
        document.body.style.overflow = selectedMedia ? 'hidden' : 'auto';
    }, [selectedMedia]);

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
        <Layout>
            <SEO
                title="Galerie - Mystic Tattoo"
                description="Découvrez notre galerie classée par styles de tatouage."
                url="https://votre-domaine.com/gallery"
            />

            <div className={styles.gallery}>
                <AnimatedSection>
                    <div className={styles.gallery__header}>
                        <h2 className={styles.gallery__title}>Galerie</h2>

                        <div className={styles.gallery__categories}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`${styles.gallery__categoryBtn} ${
                                        activeCategory === cat ? styles.active : ''
                                    }`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat === 'all' ? 'Toutes' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.gallery__grid}>
                        {filteredMedia.map((item, idx) => (
                            <AnimatedSection key={idx} delay={0.1 * idx}>
                                <div
                                    className={styles.gallery__item}
                                    onClick={() => setSelectedMedia(`http://localhost:4000${item.url}`)}
                                >
                                    {item.type === 'video' ? (
                                        <video
                                            src={`http://localhost:4000${item.url}`}
                                            muted
                                            loop
                                            autoPlay
                                            playsInline
                                            className={styles.gallery__media}
                                        />
                                    ) : (
                                        <img
                                            src={`http://localhost:4000${item.url}`}
                                            alt={item.file}
                                            className={styles.gallery__media}
                                        />
                                    )}
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </AnimatedSection>

                {selectedMedia && (
                    <div className={styles.gallery__overlay} onClick={handleOverlayClick}>
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
                                style={{ maxWidth: '70vw', maxHeight: '70vh', borderRadius: '8px' }}
                            />
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Gallery;
