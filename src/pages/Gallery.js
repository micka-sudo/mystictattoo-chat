import React, { useEffect, useState } from "react";
import api from "../lib/api";
import Layout from "../layouts/Layout";
import styles from "./Gallery.module.scss";

const Gallery = () => {
    const [media, setMedia] = useState([]);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await api.get("/media");
                setMedia(res.data);
            } catch (err) {
                console.error("Erreur chargement médias", err);
            }
        };

        fetchMedia();
    }, []);

    const categories = Array.from(
        new Set(media.map((m) => m.category || "inconnu"))
    );

    const filteredMedia =
        filter === "all"
            ? media
            : media.filter((item) => item.category === filter);

    return (
        <Layout>
            <div className={styles.gallery}>
                <h2>🎨 Galerie</h2>

                <div className={styles.filters}>
                    <button
                        onClick={() => setFilter("all")}
                        className={filter === "all" ? styles.active : ""}
                    >
                        Tous
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={filter === cat ? styles.active : ""}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className={styles.grid}>
                    {filteredMedia.map((item, idx) => (
                        <div key={idx} className={styles.mediaItem}>
                            {item.type === "image" ? (
                                <img
                                    src={`${process.env.REACT_APP_API_URL.replace(
                                        "/api",
                                        ""
                                    )}${item.url}`}
                                    alt={item.file}
                                    loading="lazy"
                                />
                            ) : (
                                <video
                                    src={`${process.env.REACT_APP_API_URL.replace(
                                        "/api",
                                        ""
                                    )}${item.url}`}
                                    controls
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Gallery;
