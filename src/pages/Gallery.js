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

// Importe les médias (images + vidéos)
const importMedia = (r) =>
    r.keys().map((key) => ({
        src: r(key),
        isVideo: /\.(mp4|webm)$/i.test(key),
    }));

const galleryMedia = {
    oldschool: importMedia(require.context('../assets/images/gallery/oldschool', false, /\.(png|jpe?g|jpg|svg|mp4|webm)$/)),
    realiste: importMedia(require.context('../assets/images/gallery/realiste', false, /\.(png|jpe?g|jpg|svg|mp4|webm)$/)),
    tribal: importMedia(require.context('../assets/images/gallery/tribal', false, /\.(png|jpe?g|jpg|svg|mp4|webm)$/)),
    japonais: importMedia(require.context('../assets/images/gallery/japonais', false, /\.(png|jpe?g|jpg|svg|mp4|webm)$/)),
    graphique: importMedia(require.context('../assets/images/gallery/graphique', false, /\.(png|jpe?g|jpg|svg|mp4|webm)$/)),
    minimaliste: importMedia(require.context('../assets/images/gallery/minimaliste', false, /\.(png|jpe?g|jpg|svg|mp4|webm)$/)),
};

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState('oldschool');
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const imageRef = useRef(null);

    useEffect(() => {
        setImages(galleryMedia[activeCategory]);
    }, [activeCategory]);

    useEffect(() => {
        document.body.style.overflow = selectedImage ? 'hidden' : 'auto';
    }, [selectedImage]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

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
                        {images.map((media, idx) => (
                            <AnimatedSection key={idx} delay={0.2 * idx}>
                                <div className="gallery__item" onClick={() => setSelectedImage(media.src)}>
                                    {media.isVideo ? (
                                        <video src={media.src} muted loop autoPlay playsInline />
                                    ) : (
                                        <img src={media.src} alt={`${activeCategory} tattoo ${idx + 1}`} />
                                    )}
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </AnimatedSection>

                {selectedImage && (
                    <div className="gallery__overlay" onClick={handleOverlayClick}>
                        {selectedImage.endsWith('.mp4') || selectedImage.endsWith('.webm') ? (
                            <video
                                ref={imageRef}
                                src={selectedImage}
                                autoPlay
                                loop
                                muted
                                controls
                                style={{ maxWidth: '70vw', maxHeight: '70vh', borderRadius: '8px' }}
                            />
                        ) : (
                            <img ref={imageRef} src={selectedImage} alt="Tatouage zoomé" />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Gallery;
