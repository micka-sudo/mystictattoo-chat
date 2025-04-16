import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { apiBase } from "../lib/api";
import Layout from "../layouts/Layout";
import styles from "./Gallery.module.scss";
import useCategories from "../hooks/useCategories"; // ← Hook personnalisé

const Gallery = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const style = searchParams.get("style");

    const [media, setMedia] = useState([]);
    const [mediaByCategory, setMediaByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const { categories = [], refreshCategories } = useCategories(); // ← Hook partagé

    const galleryItems = style ? media : Object.values(mediaByCategory).flat();

    // 🔁 Charger les médias pour chaque catégorie
    useEffect(() => {
        const fetchMedia = async () => {
            setLoading(true);
            try {
                if (style) {
                    const res = await api.get(`/media?style=${style}`);
                    setMedia(res.data);
                } else {
                    const all = {};
                    await Promise.all(
                        categories.map(async (cat) => {
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

        if (categories.length > 0) {
            fetchMedia();
        }
    }, [categories, style]);

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const prev = () => setLightboxIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
    const next = () => setLightboxIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));

    const renderItem = (item, index) => (
        <div key={index} className={styles.gallery__item}>
            {item.type === "image" ? (
                <img
                    src={`${apiBase}${item.url}`}
                    alt={item.file}
                    loading="lazy"
                    onClick={() => openLightbox(index)}
                />
            ) : (
                <video
                    src={`${apiBase}${item.url}`}
                    controls
                    onClick={() => openLightbox(index)}
                />
            )}
        </div>
    );

    return (
        <Layout>
            <div className={styles.gallery}>
                <div className={styles.gallery__header}>
                    <h2 className={styles.gallery__title}>
                        Galerie {style && `- ${style.charAt(0).toUpperCase() + style.slice(1)}`}
                    </h2>

                    <div className={styles.gallery__categories}>
                        <button
                            className={`${styles.gallery__categoryBtn} ${!style ? styles.active : ""}`}
                            onClick={() => setSearchParams({})}
                        >
                            🎨 Tous
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`${styles.gallery__categoryBtn} ${style === cat ? styles.active : ""}`}
                                onClick={() => setSearchParams({ style: cat })}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <p>Chargement...</p>
                ) : style ? (
                    <div className={styles.gallery__grid}>
                        {media.map((item, idx) => renderItem(item, idx))}
                    </div>
                ) : (
                    Object.entries(mediaByCategory).map(([cat, items]) => (
                        <section key={cat}>
                            <h3 className={styles.gallery__title}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </h3>
                            <div className={styles.gallery__grid}>
                                {items.map((item, idx) => renderItem(item, galleryItems.indexOf(item)))}
                            </div>
                        </section>
                    ))
                )}

                {lightboxIndex !== null && (
                    <div className={styles.gallery__overlay} onClick={closeLightbox}>
                        <button onClick={(e) => { e.stopPropagation(); prev(); }} className={styles.leftArrow}>
                            &#10094;
                        </button>
                        <div onClick={(e) => e.stopPropagation()}>
                            {galleryItems[lightboxIndex].type === "image" ? (
                                <img src={`${apiBase}${galleryItems[lightboxIndex].url}`} alt="lightbox" />
                            ) : (
                                <video src={`${apiBase}${galleryItems[lightboxIndex].url}`} autoPlay controls />
                            )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); next(); }} className={styles.rightArrow}>
                            &#10095;
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Gallery;
