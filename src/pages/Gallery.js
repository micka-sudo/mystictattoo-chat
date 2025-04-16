import React, { useEffect, useState } from "react";
import api from "../lib/api";
import Layout from "../layouts/Layout";
import styles from "./Gallery.module.scss";

const Gallery = () => {
    const [mediaByCategory, setMediaByCategory] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const res = await api.get("/media/categories");
                const categories = res.data;

                const allMedia = {};
                for (const cat of categories) {
                    const r = await api.get(`/media?style=${cat}`);
                    allMedia[cat] = r.data;
                }

                setMediaByCategory(allMedia);
            } catch (err) {
                console.error("Erreur chargement galerie", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const baseUrl = process.env.REACT_APP_API_URL.replace("/api", "");

    return (
        <Layout>
            <div className={styles.gallery}>
                <h2>🎨 Galerie</h2>

                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    Object.entries(mediaByCategory).map(([category, items]) => (
                        <section key={category} className={styles.categorySection}>
                            <h3 className={styles.categoryTitle}>📁 {category}</h3>
                            <div className={styles.grid}>
                                {items.map((item, idx) => (
                                    <div key={idx} className={styles.mediaItem}>
                                        {item.type === "image" ? (
                                            <img
                                                src={`${baseUrl}${item.url}`}
                                                alt={item.file}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <video
                                                src={`${baseUrl}${item.url}`}
                                                controls
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </Layout>
    );
};

export default Gallery;
