import React, { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import SEO from "../components/SEO";
import styles from "./Gallery.module.scss"; // réutilisation du style galerie
import api, { apiBase } from "../lib/api";

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
    "url": "https://www.mystic-tattoo.fr/flash",
    "sameAs": [
        "https://www.instagram.com/directory.nancy.tattoo.artists/p/CvKA3RAri-q/?locale=ne_NP",
        "https://www.facebook.com/p/Mystic-Tattoo-Nancy-100057617876652/?locale=fr_FR"
    ]
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

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const prev = () => setLightboxIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    const next = () => setLightboxIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));

    const firstImageUrl = media[0]?.url ? `${apiBase}${media[0].url}` : null;

    return (
        <Layout>
            <SEO
                title="Flash tattoos - Mystic Tattoo Nancy"
                description="Découvrez les flashs tattoos disponibles chez Mystic Tattoo à Nancy. Tatouages originaux, uniques, disponibles immédiatement."
                url="https://www.mystic-tattoo.fr/flash"
                image={firstImageUrl}
                keywords="tatouage flash Nancy, flash tattoo Nancy, Mystic Tattoo, tatoueur Nancy"
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
            />

            <div className={styles.gallery}>
                <h1 className={styles.gallery__title}>Flash tattoos disponibles</h1>

                <p style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    color: "#484748",
                    fontSize: "1.1rem",
                    maxWidth: "800px",
                    marginInline: "auto"
                }}>
                    Découvrez ici tous les flashs disponibles au salon <strong>Mystic Tattoo</strong> à Nancy.
                    Chaque dessin est une pièce unique, conçue pour être tatouée une seule fois. Disponibles immédiatement,
                    ces flashs sont idéals pour un projet rapide et original. N’attendez plus pour réserver votre coup de cœur !
                </p>

                {loading ? (
                    <p>Chargement...</p>
                ) : media.length > 0 ? (
                    <div className={styles.gallery__grid}>
                        {media.map((item, index) => (
                            <div key={index} className={styles.gallery__item}>
                                {item.type === "image" ? (
                                    <img
                                        src={`${apiBase}${item.url}`}
                                        alt="Flash tattoo Mystic Tattoo"
                                        loading="lazy"
                                        onClick={() => openLightbox(index)}
                                    />
                                ) : (
                                    <video
                                        src={`${apiBase}${item.url}`}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        onClick={() => openLightbox(index)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Aucun flash disponible pour le moment.</p>
                )}

                {lightboxIndex !== null && (
                    <div className={styles.gallery__overlay} onClick={closeLightbox}>
                        <button onClick={(e) => { e.stopPropagation(); prev(); }} className={styles.leftArrow}>
                            &#10094;
                        </button>
                        <div onClick={(e) => e.stopPropagation()}>
                            {media[lightboxIndex].type === "image" ? (
                                <img
                                    src={`${apiBase}${media[lightboxIndex].url}`}
                                    alt="Flash tattoo Mystic Tattoo"
                                />
                            ) : (
                                <video
                                    src={`${apiBase}${media[lightboxIndex].url}`}
                                    autoPlay
                                    controls
                                />
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

export default Flash;
