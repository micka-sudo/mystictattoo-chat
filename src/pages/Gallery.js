// src/pages/Gallery.js
import React, { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import AnimatedSection from '../components/AnimatedSection';
import './Gallery.scss';

const categories = [
    { id: 'oldschool', name: 'Old School' },
    { id: 'realiste', name: 'Réaliste' },
    { id: 'tribal', name: 'Tribal' },
    { id: 'japonais', name: 'Japonais' },
    { id: 'graphique', name: 'Graphique' },
    { id: 'minimaliste', name: 'Minimaliste' },
];

const importImages = (r) => r.keys().map(r);

const galleryImages = {
    oldschool: importImages(require.context('../assets/images/gallery/oldschool', false, /\.(png|jpe?g|svg)$/)),
    realiste: importImages(require.context('../assets/images/gallery/realiste', false, /\.(png|jpe?g|svg)$/)),
    tribal: importImages(require.context('../assets/images/gallery/tribal', false, /\.(png|jpe?g|svg)$/)),
    japonais: importImages(require.context('../assets/images/gallery/japonais', false, /\.(png|jpe?g|svg)$/)),
    graphique: importImages(require.context('../assets/images/gallery/graphique', false, /\.(png|jpe?g|svg)$/)),
    minimaliste: importImages(require.context('../assets/images/gallery/minimaliste', false, /\.(png|jpe?g|svg)$/)),
};

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState('oldschool');
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const imageRef = useRef(null);

    useEffect(() => {
        setImages(galleryImages[activeCategory]);
    }, [activeCategory]);

    // Désactive le scroll du body quand une image est ouverte
    useEffect(() => {
        document.body.style.overflow = selectedImage ? 'hidden' : 'auto';
    }, [selectedImage]);

    // Fermer l'overlay avec la touche "Escape"
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    // Fermer si clic en dehors de l'image zoomée
    const handleOverlayClick = (e) => {
        if (imageRef.current && !imageRef.current.contains(e.target)) {
            setSelectedImage(null);
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
                    <p>Choisissez une catégorie pour découvrir nos réalisations :</p>

                    <div className="gallery__categories">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`gallery__category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="gallery__grid">
                        {images.map((imgSrc, idx) => (
                            <AnimatedSection key={idx} delay={0.2 * idx}>
                                <div className="gallery__item">
                                    <img
                                        src={imgSrc}
                                        alt={`${activeCategory} tattoo ${idx + 1}`}
                                        onClick={() => setSelectedImage(imgSrc)}
                                    />
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </AnimatedSection>

                {selectedImage && (
                    <div className="gallery__overlay" onClick={handleOverlayClick}>
                        <img
                            ref={imageRef}
                            src={selectedImage}
                            alt="Tatouage zoomé"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default Gallery;
