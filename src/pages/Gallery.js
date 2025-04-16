import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import Layout from "../layouts/Layout";
import styles from "./Gallery.module.scss";

const Gallery = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const style = searchParams.get("style");

    const [media, setMedia] = useState([]);
    const [mediaByCategory, setMediaByCategory] = useState({});
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [lightboxIndex, setLightboxIndex] = useState(null); // index dans media[]
    const baseUrl = process.env.REACT_APP_API_URL.replace("/api", "");

    const galleryItems = style ? media : Object.values(mediaByCategory).flat();

    // Charger les catégories
    useEffect(() => {
        api.get("/media/categories")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Erreur chargement catégories", err));
    }, []);

    // Charger les médias
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                setLoading(true);

                if (style) {
                    const res = await api.get(`/media?style=${style}`);
                    setMedia(res.data);
                } else {
                    const allMedia = {};
                    const res = await api.get("/media/categories");
                    const categories = res.data;

                    for (const cat of categories) {
                        const r = await api.get(`/media?style=${cat}`);
                        allMedia[cat] = r.data;
                    }

                    setMediaByCategory(allMedia);
                }
            } catch (err) {
                console.error("Erreur chargement médias", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, [style]);

    // Ouvre la lightbox
    const openLightbox = (index) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => setLightboxIndex(null);

    const prev = () => {
        setLightboxIndex((prev) =>
            prev === 0 ? galleryItems.length - 1 : prev - 1
        );
    };

    const next = () => {
        setLightboxIndex((prev) =>
            prev === galleryItems.length - 1 ? 0 : prev + 1
        );
    };

    const renderItem = (item, index) => (
        <div key={index} className={styles["gallery__item"]}>
            {item.type === "image" ? (
                <img
                    src={`${baseUrl}${item.url}`}
                    alt={item.file}
                    loading="lazy"
                    onClick={() => openLightbox(index)}
                />
            ) : (
                <video
                    src={`${baseUrl}${item.url}`}
                    controls
                    onClick={() => openLightbox(index)}
                />
            )}
        </div>
    );

    return (
        <Layout>
            <div className={styles.gallery}>
                <div className={styles["gallery__header"]}>
                    <h2 className={styles["gallery__title"]}>
                        🎨 Galerie {style && `- ${style}`}
                    </h2>

                    <div className={styles["gallery__categories"]}>
                        <button
                            className={`${styles["gallery__categoryBtn"]} ${!style ? styles.active : ""}`}
                            onClick={() => setSearchParams({})}
                        >
                            Tous
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`${styles["gallery__categoryBtn"]} ${style === cat ? styles.active : ""}`}
                                onClick={() => setSearchParams({ style: cat })}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <p>Chargement...</p>
                ) : style ? (
                    <div className={styles["gallery__grid"]}>
                        {media.map((item, idx) => renderItem(item, idx))}
                    </div>
                ) : (
                    Object.entries(mediaByCategory).map(([category, items]) => (
                        <section key={category}>
                            <h3 className={styles["gallery__title"]}>📁 {category}</h3>
                            <div className={styles["gallery__grid"]}>
                                {items.map((item, idx) =>
                                    renderItem(item, galleryItems.indexOf(item))
                                )}
                            </div>
                        </section>
                    ))
                )}

                {/* Lightbox */}
                {lightboxIndex !== null && (
                    <div className={styles["gallery__overlay"]} onClick={closeLightbox}>
                        <button onClick={(e) => { e.stopPropagation(); prev(); }} style={arrowStyle}>←</button>
                        <div onClick={(e) => e.stopPropagation()}>
                            {galleryItems[lightboxIndex].type === "image" ? (
                                <img
                                    src={`${baseUrl}${galleryItems[lightboxIndex].url}`}
                                    alt="lightbox"
                                />
                            ) : (
                                <video
                                    src={`${baseUrl}${galleryItems[lightboxIndex].url}`}
                                    autoPlay
                                    controls
                                />
                            )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); next(); }} style={arrowStyle}>→</button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

// Style inline simple pour flèches
const arrowStyle = {
    position: "absolute",
    top: "50%",
    fontSize: "2rem",
    color: "#fff",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    zIndex: 10001,
    transform: "translateY(-50%)",
    padding: "0 20px",
};

export default Gallery;
