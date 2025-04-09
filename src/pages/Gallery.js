// src/pages/Gallery.js
import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import AnimatedSection from '../components/AnimatedSection';
import './Gallery.scss';

// Liste des catégories
const categories = [
    { id: 'oldschool', name: 'Old School' },
    { id: 'realiste', name: 'Réaliste' },
    { id: 'tribal', name: 'Tribal' },
    { id: 'japonais', name: 'Japonais' },
    { id: 'graphique', name: 'Graphique' },
    { id: 'minimaliste', name: 'Minimaliste' },
];

// Chargement dynamique des images
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

    useEffect(() => {
        // Charge automatiquement les images de la catégorie sélectionnée
        setImages(galleryImages[activeCategory]);
    }, [activeCategory]);

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
                                    <img src={imgSrc} alt={`${activeCategory} tattoo ${idx + 1}`} />
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </>
    );
};

export default Gallery;
