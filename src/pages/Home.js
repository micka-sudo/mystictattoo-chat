import React, { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import styles from "./Home.module.scss";
import api, { apiBase } from "../lib/api";
import SEO from "../components/SEO";

const SEO_KEYWORDS =
    "tatoueur Nancy, salon de tatouage Nancy, tatouage Nancy, Mystic Tattoo, tattoo Nancy, tatoueur artistique Nancy, tatouage personnalisé Nancy, galerie tatouage Nancy, meilleur tatoueur Nancy, tatouage réaliste Nancy, tatouage japonais Nancy, tatouage oldschool Nancy, rendez-vous tatouage Nancy, tarif tatouage Nancy";

// 🔎 Données structurées pour Google
const SCHEMA_ORG = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: "Mystic Tattoo",
    image: "https://www.mystic-tattoo.fr/logo.png",
    address: {
        "@type": "PostalAddress",
        streetAddress: "19 Boulevard Jean Jaurès",
        addressLocality: "Nancy",
        postalCode: "54000",
        addressCountry: "FR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: 48.6921,
        longitude: 6.1844,
    },
    telephone: "+33688862646",
    url: "https://www.mystic-tattoo.fr",
    sameAs: [
        "https://www.instagram.com/directory.nancy.tattoo.artists/p/CvKA3RAri-q/?locale=ne_NP",
        "https://www.facebook.com/p/Mystic-Tattoo-Nancy-100057617876652/?locale=fr_FR",
    ],
};

/**
 * Ajoute un "/" au début du chemin si absent.
 */
function ensureLeadingSlash(p = "") {
    return p.startsWith("/") ? p : `/${p}`;
}

/**
 * Construit l'URL complète d'une image backend.
 * - Si `cloudinaryUrl` existe → priorité.
 * - Sinon `path` → apiBase + path
 * - Sinon `url` → apiBase + url
 */
const buildMediaUrl = (media) => {
    if (!media) return "";
    if (media.cloudinaryUrl) return media.cloudinaryUrl;

    const filePath = media.path || media.url || media.image || "";
    if (!filePath) return "";

    // Si le path est déjà une URL absolue, on le renvoie tel quel
    if (typeof filePath === "string" && filePath.startsWith("http")) {
        return filePath;
    }

    return `${apiBase}${ensureLeadingSlash(filePath)}`;
};

/**
 * Construit l'URL d'une image d'actualité.
 * On gère le cas où l'API renvoie déjà une URL complète.
 */
const buildNewsImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string" && image.startsWith("http")) {
        return image;
    }
    return `${apiBase}${ensureLeadingSlash(image)}`;
};

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState("");
    const [news, setNews] = useState([]);
    const [showNews, setShowNews] = useState(true); // à terme : valeur venant du backend / admin

    // 🔁 Image d'accueil aléatoire
    const fetchRandomImage = async () => {
        try {
            console.log("Home ▶️ Appel /media/random");
            const res = await api.get("/media/random");

            // Selon le backend, res.data peut être :
            // - directement un objet media
            // - ou { media: {...} }
            const media =
                res.data && res.data.media
                    ? res.data.media
                    : Array.isArray(res.data)
                        ? res.data[0]
                        : res.data;

            console.log("Home ▶️ media random reçu :", media);

            const url = buildMediaUrl(media);
            console.log("Home ▶️ URL fond calculée :", url);
            setBackgroundUrl(url);
        } catch (err) {
            console.error("Erreur chargement image d’accueil", err);
            setBackgroundUrl("");
        }
    };

    // 🔁 Dernières actualités (3 max)
    const fetchNews = async () => {
        try {
            console.log("Home ▶️ Appel /news");
            const res = await api.get("/news");
            console.log("Home ▶️ News reçues :", res.data);
            setNews(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Erreur chargement actualités", err);
            setNews([]);
        }
    };

    // ⏱ Initialisation
    useEffect(() => {
        fetchRandomImage();
        fetchNews();

        const interval = setInterval(fetchRandomImage, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            {/* ✅ SEO */}
            <SEO
                title="Tatoueur Nancy - Mystic Tattoo | Salon de tatouage artistique à Nancy 54000"
                description="Mystic Tattoo est le salon de tatouage incontournable à Nancy (54000). Artistes tatoueurs passionnés, galerie de tatouages, prise de rendez-vous en ligne, hygiène irréprochable, conseils personnalisés."
                url="https://www.mystic-tattoo.fr"
                image={backgroundUrl || "https://www.mystic-tattoo.fr/default-cover.jpg"}
                keywords={SEO_KEYWORDS}
            />

            {/* ✅ Données structurées SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
            />

            <div className={styles.home}>
                <h1 className={styles.home__title}>Bienvenue chez Mystic Tattoo</h1>
                <p className={styles.home__subtitle}>
                    Tatouage artistique, styles variés, découvrez nos créations à Nancy.
                </p>
                <p
                    style={{
                        textAlign: "center",
                        fontSize: "1rem",
                        maxWidth: "800px",
                        margin: "0 auto 30px",
                        color: "white",
                    }}
                >
                    Mystic Tattoo est une salle de tatouage privative et indépendante
                    depuis 2006, incontournable à Nancy (54000). Tatoueur passionné, je
                    vous accueille dans un espace dédié alliant hygiène irréprochable,
                    conseils personnalisés et créativité. Découvrez ma galerie, prenez
                    rendez-vous en ligne et vivez une expérience unique, en toute
                    confidentialité.
                </p>

                <div
                    className={
                        showNews ? styles.home__main : styles.home__singleColumn
                    }
                >
                    {/* 🎨 Image d'accueil */}
                    <div
                        className={
                            showNews ? styles.home__hero : styles.home__heroFull
                        }
                    >
                        <div
                            className={styles.home__heroBg}
                            style={
                                backgroundUrl
                                    ? { backgroundImage: `url('${backgroundUrl}')` }
                                    : {}
                            }
                        ></div>
                    </div>

                    {/* 📰 Bloc actualités */}
                    {showNews && (
                        <section className={styles.home__content}>
                            <h2>Actualité</h2>
                            {news.length === 0 ? (
                                <p>Aucune actualité pour le moment.</p>
                            ) : (
                                <ul className={styles.home__newsList}>
                                    {news
                                        .slice(-3)
                                        .reverse()
                                        .map((item) => (
                                            <li
                                                key={item.id || item._id}
                                                className={styles.home__newsItem}
                                            >
                                                <strong>{item.title}</strong>
                                                {item.image && (
                                                    <img
                                                        src={buildNewsImageUrl(item.image)}
                                                        alt={`Actualité Mystic Tattoo : ${item.title} | Tatouage Nancy`}
                                                    />
                                                )}
                                                {item.content && (
                                                    <p>
                                                        {item.content.slice(0, 100)}
                                                        ...
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Home;
