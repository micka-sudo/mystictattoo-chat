import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../layouts/Layout";
import styles from "./Home.module.scss";
import api, { apiBase } from "../lib/api";
import { heroImageProps, articleImageProps } from "../lib/cloudinary";
import SEO from "../components/SEO";

const SEO_KEYWORDS =
    "tatoueur Nancy, salon de tatouage Nancy, tatouage Nancy, Mystic Tattoo, tattoo Nancy, tatoueur artistique Nancy, tatouage personnalisé Nancy, galerie tatouage Nancy, meilleur tatoueur Nancy, tatouage réaliste Nancy, tatouage japonais Nancy, tatouage oldschool Nancy, rendez-vous tatouage Nancy, tarif tatouage Nancy";

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

const FEATURES = [
    {
        icon: "🎨",
        title: "Créativité",
        description: "Des designs uniques adaptés à votre personnalité"
    },
    {
        icon: "🏆",
        title: "Expérience",
        description: "Plus de 18 ans de passion et de savoir-faire"
    },
    {
        icon: "🛡️",
        title: "Hygiène",
        description: "Normes sanitaires strictes et matériel stérile"
    },
    {
        icon: "💬",
        title: "Conseil",
        description: "Accompagnement personnalisé pour votre projet"
    }
];

function ensureLeadingSlash(p = "") {
    return p.startsWith("/") ? p : `/${p}`;
}

const buildMediaUrl = (media) => {
    if (!media) return "";
    if (media.cloudinaryUrl) return media.cloudinaryUrl;
    if (media.cloudUrl) return media.cloudUrl;

    const filePath = media.path || media.url || media.image || "";
    if (!filePath) return "";

    if (typeof filePath === "string" && filePath.startsWith("http")) {
        return filePath;
    }

    return `${apiBase}${ensureLeadingSlash(filePath)}`;
};

const buildNewsImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string" && image.startsWith("http")) {
        return image;
    }
    return `${apiBase}${ensureLeadingSlash(image)}`;
};

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState("");
    const [nextImageUrl, setNextImageUrl] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [noAccueilMedia, setNoAccueilMedia] = useState(false);
    const [news, setNews] = useState([]);
    const [visibleFeatures, setVisibleFeatures] = useState([]);

    const fetchRandomImage = async (isInitial = false) => {
        try {
            const res = await api.get(`/media/random?t=${Date.now()}`);
            const media = res.data;
            const url = buildMediaUrl(media);

            setNoAccueilMedia(false);

            if (isInitial || !backgroundUrl) {
                setBackgroundUrl(url);
                setIsLoading(false);
            } else {
                setNextImageUrl(url);
                const img = new Image();
                img.onload = () => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setBackgroundUrl(url);
                        setIsTransitioning(false);
                        setNextImageUrl("");
                    }, 500);
                };
                img.src = url;
            }
        } catch (err) {
            console.error("Erreur chargement image d'accueil", err);
            if (err.response?.status === 404) {
                setNoAccueilMedia(true);
            }
            setIsLoading(false);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await api.get("/news");
            setNews(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Erreur chargement actualités", err);
            setNews([]);
        }
    };

    useEffect(() => {
        fetchRandomImage(true);
        fetchNews();

        const interval = setInterval(() => fetchRandomImage(false), 10000);
        return () => clearInterval(interval);
    }, []);

    // Animation des features au scroll
    useEffect(() => {
        const timer = setTimeout(() => {
            FEATURES.forEach((_, index) => {
                setTimeout(() => {
                    setVisibleFeatures(prev => [...prev, index]);
                }, index * 150);
            });
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Layout>
            <SEO
                title="Tatoueur Nancy - Mystic Tattoo | Salon de tatouage artistique à Nancy 54000"
                description="Mystic Tattoo est le salon de tatouage incontournable à Nancy (54000). Artistes tatoueurs passionnés, galerie de tatouages, prise de rendez-vous en ligne, hygiène irréprochable, conseils personnalisés."
                url="https://www.mystic-tattoo.fr"
                image={backgroundUrl || "https://www.mystic-tattoo.fr/default-cover.jpg"}
                keywords={SEO_KEYWORDS}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
            />

            <div className={styles.home}>
                {/* HERO SECTION - Plein écran immersif */}
                <section className={styles.hero}>
                    <div className={styles.hero__background}>
                        {noAccueilMedia ? (
                            <div className={styles.hero__noMedia}>
                                <p>Ajoutez des images dans "Accueil" depuis l'admin.</p>
                            </div>
                        ) : (
                            <>
                                {backgroundUrl && (
                                    <img
                                        {...heroImageProps(backgroundUrl)}
                                        alt="Tatouage artistique Mystic Tattoo Nancy"
                                        className={`${styles.hero__image}${
                                            isTransitioning ? ` ${styles["hero__image--transitioning"]}` : ""
                                        }`}
                                        fetchpriority="high"
                                        loading="eager"
                                        decoding="async"
                                    />
                                )}
                                {nextImageUrl && (
                                    <img
                                        {...heroImageProps(nextImageUrl)}
                                        alt=""
                                        className={`${styles.hero__image} ${styles["hero__image--next"]}`}
                                        loading="eager"
                                        decoding="async"
                                        aria-hidden="true"
                                    />
                                )}
                                {isLoading && <div className={styles.hero__skeleton}></div>}
                            </>
                        )}
                        <div className={styles.hero__overlay}></div>
                    </div>

                    <div className={styles.hero__content}>
                        <h1 className={styles.hero__title}>
                            <span className={styles.hero__titleLine}>Mystic</span>
                            <span className={styles.hero__titleLine}>Tattoo</span>
                        </h1>
                        <p className={styles.hero__tagline}>
                            L'art du tatouage à Nancy depuis 2006
                        </p>
                        <div className={styles.hero__cta}>
                            <Link to="/gallery" className={styles.hero__button}>
                                Découvrir la galerie
                            </Link>
                            <Link to="/contact" className={styles.hero__buttonSecondary}>
                                Prendre rendez-vous
                            </Link>
                        </div>
                    </div>

                    <div
                        className={styles.hero__scroll}
                        onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ cursor: 'pointer' }}
                    >
                        <span>Découvrir</span>
                        <div className={styles.hero__scrollIcon}></div>
                    </div>
                </section>

                {/* INTRODUCTION */}
                <section id="intro" className={styles.intro}>
                    <div className={styles.intro__container}>
                        <h2 className={styles.intro__title}>Bienvenue dans mon univers</h2>
                        <p className={styles.intro__text}>
                            Mystic Tattoo est une salle de tatouage privative et indépendante,
                            incontournable à Nancy depuis 2006. Tatoueur passionné, je vous
                            accueille dans un espace dédié alliant hygiène irréprochable,
                            conseils personnalisés et créativité. Découvrez ma galerie et
                            vivez une expérience unique, en toute confidentialité.
                        </p>
                    </div>
                </section>

                {/* FEATURES - Pourquoi nous choisir */}
                <section className={styles.features}>
                    <h2 className={styles.features__title}>Pourquoi me choisir ?</h2>
                    <div className={styles.features__grid}>
                        {FEATURES.map((feature, index) => (
                            <div
                                key={index}
                                className={`${styles.features__item} ${
                                    visibleFeatures.includes(index) ? styles["features__item--visible"] : ""
                                }`}
                            >
                                <span className={styles.features__icon}>{feature.icon}</span>
                                <h3 className={styles.features__itemTitle}>{feature.title}</h3>
                                <p className={styles.features__itemText}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* GALERIE PREVIEW */}
                <section className={styles.galleryPreview}>
                    <div className={styles.galleryPreview__content}>
                        <h2 className={styles.galleryPreview__title}>Explorez mes créations</h2>
                        <p className={styles.galleryPreview__text}>
                            Réaliste, japonais, old school, graphique... Chaque style raconte une histoire unique.
                        </p>
                        <Link to="/gallery" className={styles.galleryPreview__button}>
                            Voir toute la galerie
                        </Link>
                    </div>
                </section>

                {/* ACTUALITÉS */}
                {news.length > 0 && (
                    <section className={styles.newsSection}>
                        <div className={styles.newsSection__header}>
                            <span className={styles.newsSection__badge}>Nouveautés</span>
                            <h2 className={styles.newsSection__title}>Actualités du salon</h2>
                            <p className={styles.newsSection__subtitle}>
                                Restez informé des dernières créations et événements
                            </p>
                        </div>
                        <div className={styles.newsSection__grid}>
                            {news.slice(-3).reverse().map((item, index) => (
                                <article
                                    key={item.id || item._id}
                                    className={`${styles.newsSection__item} ${index === 0 ? styles['newsSection__item--featured'] : ''}`}
                                >
                                    {item.image && (
                                        <div className={styles.newsSection__imageWrapper}>
                                            <img
                                                {...articleImageProps(buildNewsImageUrl(item.image))}
                                                alt={`Actualité : ${item.title}`}
                                                className={styles.newsSection__image}
                                                loading="lazy"
                                            />
                                            <div className={styles.newsSection__imageOverlay}></div>
                                        </div>
                                    )}
                                    <div className={styles.newsSection__content}>
                                        <span className={styles.newsSection__date}>
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Récent'}
                                        </span>
                                        <h3 className={styles.newsSection__itemTitle}>{item.title}</h3>
                                        {item.content && (
                                            <p className={styles.newsSection__itemText}>
                                                {item.content.slice(0, 150)}...
                                            </p>
                                        )}
                                        <span className={styles.newsSection__readMore}>
                                            Lire la suite →
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA FINAL */}
                <section className={styles.ctaSection}>
                    <div className={styles.ctaSection__content}>
                        <h2 className={styles.ctaSection__title}>Prêt à concrétiser votre projet ?</h2>
                        <p className={styles.ctaSection__text}>
                            Contactez-moi pour discuter de votre idée et obtenir un devis personnalisé.
                        </p>
                        <Link to="/contact" className={styles.ctaSection__button}>
                            Me contacter
                        </Link>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Home;
