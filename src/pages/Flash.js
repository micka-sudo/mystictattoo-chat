import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Layout from "../layouts/Layout";
import SEO from "../components/SEO";
import styles from "./Flash.module.scss";
import api, { apiBase } from "../lib/api";
import { thumbnailImageProps, optimizeCloudinaryUrl } from "../lib/cloudinary";

function ensureLeadingSlash(p = "") {
    return p.startsWith("/") ? p : `/${p}`;
}

function buildMediaSrc(item) {
    if (!item) return "";
    const cloud = item.cloudinaryUrl || item.cloudUrl || null;
    if (cloud && typeof cloud === "string") return cloud;
    const p = ensureLeadingSlash(item.path || item.url || "");
    return `${apiBase}${p}`;
}

const SCHEMA_ORG = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    "name": "Mystic Tattoo",
    "image": "https://www.mystic-tattoo.fr/logo.png",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "19 Boulevard Jean Jaurès",
        "addressLocality": "Nancy",
        "postalCode": "54000",
        "addressCountry": "FR"
    },
    "telephone": "+33688862646",
    "url": "https://www.mystic-tattoo.fr/flash"
};

const Flash = () => {
    const [media, setMedia] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlash = async () => {
            try {
                const res = await api.get("/media?style=Flash");
                setMedia(res.data);
            } catch (err) {
                console.error("Erreur chargement flash", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlash();
    }, []);

    const openLightbox = useCallback((index) => setLightboxIndex(index), []);
    const closeLightbox = useCallback(() => setLightboxIndex(null), []);
    const prev = useCallback(() => {
        setLightboxIndex((p) => (p === 0 ? media.length - 1 : p - 1));
    }, [media.length]);
    const next = useCallback(() => {
        setLightboxIndex((p) => (p === media.length - 1 ? 0 : p + 1));
    }, [media.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex, closeLightbox, prev, next]);

    const firstImageUrl = media[0] ? buildMediaSrc(media[0]) : null;

    // Skeleton loader
    const SkeletonGrid = ({ count = 8 }) => (
        <div className={styles.skeleton}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={styles.skeleton__item} />
            ))}
        </div>
    );

    return (
        <Layout>
            <SEO
                title="Flash Tattoos Disponibles - Mystic Tattoo Nancy"
                description="Découvrez les flash tattoos disponibles chez Mystic Tattoo à Nancy. Designs originaux et uniques, disponibles immédiatement. Réservez votre coup de coeur !"
                url="https://www.mystic-tattoo.fr/flash"
                image={firstImageUrl}
                keywords="tatouage flash Nancy, flash tattoo Nancy, Mystic Tattoo, tatoueur Nancy, tattoo disponible Nancy"
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
            />

            <div className={styles.flash}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <span className={styles.hero__badge}>Flash Tattoos</span>
                    <h1 className={styles.hero__title}>
                        Designs <span>Disponibles</span>
                    </h1>
                    <p className={styles.hero__subtitle}>
                        Des créations uniques prêtes à être tatouées. Chaque flash est une pièce originale,
                        conçue avec passion et disponible immédiatement.
                    </p>

                    <div className={styles.hero__features}>
                        <div className={styles.hero__feature}>
                            <span className={styles.hero__featureIcon}>⚡</span>
                            <span>Disponible immédiatement</span>
                        </div>
                        <div className={styles.hero__feature}>
                            <span className={styles.hero__featureIcon}>🎨</span>
                            <span>Design unique</span>
                        </div>
                        <div className={styles.hero__feature}>
                            <span className={styles.hero__featureIcon}>💰</span>
                            <span>Prix fixe</span>
                        </div>
                    </div>
                </section>

                {/* Info Box */}
                <div className={styles.infoBox}>
                    <h2 className={styles.infoBox__title}>Comment ça marche ?</h2>
                    <p className={styles.infoBox__text}>
                        Chaque flash est un design original créé par mes soins. Une fois tatoué,
                        il devient exclusif à son propriétaire. Parcourez la galerie, trouvez votre
                        coup de coeur et contactez-moi pour réserver votre créneau !
                    </p>
                    <Link to="/contact" className={styles.infoBox__cta}>
                        Réserver un flash
                    </Link>
                </div>

                {/* Grid */}
                <main className={styles.content}>
                    <h2 className={styles.sectionTitle}>
                        {media.length} flash{media.length > 1 ? 's' : ''} disponible{media.length > 1 ? 's' : ''}
                    </h2>

                    {loading ? (
                        <SkeletonGrid count={8} />
                    ) : media.length > 0 ? (
                        <div className={styles.grid}>
                            {media.map((item, index) => (
                                <article
                                    key={index}
                                    className={styles.card}
                                    onClick={() => openLightbox(index)}
                                >
                                    <span className={styles.card__available}>Dispo</span>

                                    {item.type === "video" ? (
                                        <video
                                            src={buildMediaSrc(item)}
                                            className={styles.card__image}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            {...thumbnailImageProps(buildMediaSrc(item), 400)}
                                            alt="Flash tattoo disponible - Mystic Tattoo Nancy"
                                            className={styles.card__image}
                                            loading="lazy"
                                        />
                                    )}

                                    <div className={styles.card__overlay}>
                                        <span className={styles.card__badge}>Voir le flash</span>
                                        <span className={styles.card__text}>Cliquez pour agrandir</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.empty__icon}>⚡</div>
                            <p className={styles.empty__text}>
                                Aucun flash disponible pour le moment.<br />
                                Revenez bientôt pour découvrir de nouveaux designs !
                            </p>
                            <Link to="/gallery" className={styles.empty__cta}>
                                Voir la galerie
                            </Link>
                        </div>
                    )}
                </main>

                {/* Lightbox */}
                {lightboxIndex !== null && media[lightboxIndex] && (
                    <div className={styles.lightbox} onClick={closeLightbox}>
                        <button className={styles.lightbox__close} onClick={closeLightbox} />

                        <button
                            className={`${styles.lightbox__nav} ${styles["lightbox__nav--prev"]}`}
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                        >
                            &#10094;
                        </button>

                        <div className={styles.lightbox__content} onClick={(e) => e.stopPropagation()}>
                            {media[lightboxIndex].type === "video" ? (
                                <video
                                    src={buildMediaSrc(media[lightboxIndex])}
                                    className={styles.lightbox__media}
                                    autoPlay
                                    controls
                                />
                            ) : (
                                <img
                                    src={optimizeCloudinaryUrl(buildMediaSrc(media[lightboxIndex]), {
                                        width: 1600,
                                        quality: 'auto:good'
                                    })}
                                    alt="Flash tattoo - Mystic Tattoo Nancy"
                                    className={styles.lightbox__media}
                                />
                            )}
                        </div>

                        <button
                            className={`${styles.lightbox__nav} ${styles["lightbox__nav--next"]}`}
                            onClick={(e) => { e.stopPropagation(); next(); }}
                        >
                            &#10095;
                        </button>

                        <div className={styles.lightbox__counter}>
                            {lightboxIndex + 1} / {media.length}
                        </div>

                        <Link
                            to="/contact"
                            className={styles.lightbox__cta}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Réserver ce flash
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Flash;
