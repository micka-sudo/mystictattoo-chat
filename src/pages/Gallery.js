// ✅ Gallery.js corrigé (path au lieu de url)

import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api, { apiBase } from "../lib/api";
import Layout from "../layouts/Layout";
import styles from "./Gallery.module.scss";
import useCategories from "../hooks/useCategories";
import SEO from "../components/SEO";

const SEO_KEYWORDS_BASE =
    "tatoueur Nancy, salon de tatouage Nancy, tatouage Nancy, tatouage artistique Nancy, Mystic Tattoo, tattoo Nancy, meilleur tatoueur Nancy, galerie tatouage Nancy, tatouage personnalisé Nancy";

const styleKeywords = {
    japonais: "tatouage japonais Nancy, tatoueur japonais Nancy, style japonais",
    realiste: "tatouage réaliste Nancy, tatoueur réaliste Nancy, style réaliste",
    oldschool: "tatouage oldschool Nancy, tatoueur oldschool Nancy, style oldschool",
    minimaliste: "tatouage minimaliste Nancy, tatoueur minimaliste Nancy, style minimaliste",
    graphique: "tatouage graphique Nancy, tatoueur graphique Nancy, style graphique",
    blackwork: "tatouage blackwork Nancy, tatoueur blackwork Nancy, style blackwork"
};

const Gallery = () => {
    const { style } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [media, setMedia] = useState([]);
    const [mediaByCategory, setMediaByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const { categories = [] } = useCategories();
    const filteredCategories = categories.filter((cat) => cat.toLowerCase() !== "flash");
    const galleryItems = style ? media : Object.values(mediaByCategory).flat();

    const styleTitle = style ? `${style.charAt(0).toUpperCase() + style.slice(1)}` : "Tous les styles";
    const pageTitle = style
        ? `Tatouage ${styleTitle} Nancy - Galerie Mystic Tattoo`
        : `Galerie de tatouages - Mystic Tattoo Nancy`;
    const pageDescription = style
        ? `Découvrez nos tatouages de style ${styleTitle} réalisés à Nancy par Mystic Tattoo. Tatoueur spécialisé en ${styleTitle}, prise de rendez-vous en ligne, galerie, inspiration.`
        : `Explorez tous les styles de tatouage proposés par Mystic Tattoo à Nancy : japonais, réaliste, graphique, oldschool, minimaliste... Réservez votre séance.`;
    const canonicalUrl = style
        ? `https://www.mystic-tattoo.fr/gallery/${style}`
        : `https://www.mystic-tattoo.fr/gallery`;
    const firstImageUrl = galleryItems[0]?.path ? `${apiBase}${galleryItems[0].path}` : null;

    const keywords = style
        ? `${SEO_KEYWORDS_BASE}, ${styleKeywords[style] || styleTitle + " Nancy, tatouage " + styleTitle.toLowerCase() + " Nancy"}`
        : SEO_KEYWORDS_BASE;

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
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 48.6921,
            "longitude": 6.1844
        },
        "telephone": "+33688862646",
        "url": `https://www.mystic-tattoo.fr/gallery${style ? `/${style}` : ''}`,
        "sameAs": [
            "https://www.instagram.com/directory.nancy.tattoo.artists/p/CvKA3RAri-q/?locale=ne_NP",
            "https://www.facebook.com/p/Mystic-Tattoo-Nancy-100057617876652/?locale=fr_FR"
        ]
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const oldStyle = query.get("style");
        if (oldStyle) {
            navigate(`/gallery/${oldStyle}`, { replace: true });
        }
    }, [location.search, navigate]);

    useEffect(() => {
        const fetchMedia = async () => {
            setLoading(true);
            try {
                if (style) {
                    if (style.toLowerCase() === "flash") {
                        navigate("/flash", { replace: true });
                        return;
                    }
                    const res = await api.get(`/media?style=${style}`);
                    setMedia(res.data);
                } else {
                    const all = {};
                    await Promise.all(
                        filteredCategories.map(async (cat) => {
                            const res = await api.get(`/media?style=${cat}`);
                            all[cat] = res.data;
                        })
                    );
                    setMediaByCategory(all);
                }
            } catch (err) {
                console.error("Erreur chargement médias", err);
            } finally {
                setLoading(false);
            }
        };

        if (categories.length > 0) fetchMedia();
    }, [categories, style]);

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const prev = () => setLightboxIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
    const next = () => setLightboxIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));

    const renderItem = (item, index) => (
        <div key={index} className={styles.gallery__item}>
            {item.type === "image" ? (
                <img
                    src={`${apiBase}${item.path}`}
                    alt={`Tatouage ${styleTitle} à Nancy - Mystic Tattoo`}
                    loading="lazy"
                    onClick={() => openLightbox(index)}
                />
            ) : (
                <video
                    src={`${apiBase}${item.path}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onClick={() => openLightbox(index)}
                />
            )}
        </div>
    );

    return (
        <Layout>
            <SEO
                title={pageTitle}
                description={pageDescription}
                url={canonicalUrl}
                image={firstImageUrl}
                keywords={keywords}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
            />

            <div className={styles.gallery}>
                <div className={styles.gallery__header}>
                    <h1 className={styles.gallery__title}>
                        Galerie {style && `- ${style.charAt(0).toUpperCase() + style.slice(1)}`}
                    </h1>
                    {style && (
                        <p style={{ textAlign: "center", color: "white", fontSize: "1.1rem", marginBottom: "20px" }}>
                            Découvrez nos créations de tatouages <strong>{styleTitle.toLowerCase()}</strong> réalisées à Nancy.
                            Un style {styleTitle.toLowerCase()} unique, dessiné avec passion par Mystic Tattoo.
                        </p>
                    )}
                    <div className={styles.gallery__categories}>
                        <button className={`${styles.gallery__categoryBtn} ${!style ? styles.active : ""}`} onClick={() => navigate("/gallery")}>Tous</button>
                        {filteredCategories.map((cat) => {
                            const hasMedia = mediaByCategory[cat]?.length > 0;
                            if (!style && !hasMedia) return null;
                            return (
                                <button
                                    key={cat}
                                    className={`${styles.gallery__categoryBtn} ${style === cat ? styles.active : ""}`}
                                    onClick={() => navigate(`/gallery/${cat}`)}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <p>Chargement...</p>
                ) : style ? (
                    <div className={styles.gallery__grid}>
                        {media.length > 0 ? media.map((item, idx) => renderItem(item, idx)) : <p>Aucun média trouvé dans cette catégorie.</p>}
                    </div>
                ) : (
                    Object.entries(mediaByCategory).map(([cat, items]) => {
                        if (!items || items.length === 0) return null;
                        return (
                            <section key={cat}>
                                <h2 className={styles.gallery__title}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>
                                <div className={styles.gallery__grid}>
                                    {items.map((item, idx) => renderItem(item, galleryItems.indexOf(item)))}
                                </div>
                            </section>
                        );
                    })
                )}

                {lightboxIndex !== null && (
                    <div className={styles.gallery__overlay} onClick={closeLightbox}>
                        <button onClick={(e) => { e.stopPropagation(); prev(); }} className={styles.leftArrow}>&#10094;</button>
                        <div onClick={(e) => e.stopPropagation()}>
                            {galleryItems[lightboxIndex].type === "image" ? (
                                <img src={`${apiBase}${galleryItems[lightboxIndex].path}`} alt={`Tatouage ${styleTitle} à Nancy - Mystic Tattoo`} />
                            ) : (
                                <video src={`${apiBase}${galleryItems[lightboxIndex].path}`} autoPlay controls />
                            )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); next(); }} className={styles.rightArrow}>&#10095;</button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Gallery;
