import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api, { apiBase } from "../lib/api";
import { thumbnailImageProps, optimizeCloudinaryUrl } from "../lib/cloudinary";
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

function capitalizeFirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Icone zoom SVG
const ZoomIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
        <path d="M11 8v6M8 11h6"/>
    </svg>
);

const Gallery = () => {
    const { style } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [media, setMedia] = useState([]);
    const [mediaByCategory, setMediaByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const { categories = [] } = useCategories();
    const filteredCategories = useMemo(() =>
        categories.filter((cat) => cat.toLowerCase() !== "flash"),
        [categories]
    );

    // Tous les items pour la galerie
    const galleryItems = useMemo(() => {
        if (style) return media;
        return Object.values(mediaByCategory).flat();
    }, [style, media, mediaByCategory]);

    // Stats
    const totalCount = galleryItems.length;
    const categoriesCount = filteredCategories.length;

    // SEO
    const styleTitle = style ? capitalizeFirst(style) : "Tous les styles";
    const pageTitle = style
        ? `Tatouage ${styleTitle} Nancy - Galerie Mystic Tattoo`
        : `Galerie de tatouages - Mystic Tattoo Nancy`;
    const pageDescription = style
        ? `Découvrez nos tatouages de style ${styleTitle} réalisés à Nancy par Mystic Tattoo. Tatoueur spécialisé en ${styleTitle}, prise de rendez-vous en ligne.`
        : `Explorez tous les styles de tatouage proposés par Mystic Tattoo à Nancy : japonais, réaliste, graphique, oldschool, minimaliste...`;
    const canonicalUrl = style
        ? `https://www.mystic-tattoo.fr/gallery/${style}`
        : `https://www.mystic-tattoo.fr/gallery`;
    const firstImageUrl = galleryItems[0] ? buildMediaSrc(galleryItems[0]) : null;
    const keywords = style
        ? `${SEO_KEYWORDS_BASE}, ${styleKeywords[style] || styleTitle + " Nancy"}`
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
        "telephone": "+33688862646",
        "url": canonicalUrl
    };

    // Redirect ancien format
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const oldStyle = query.get("style");
        if (oldStyle) navigate(`/gallery/${oldStyle}`, { replace: true });
    }, [location.search, navigate]);

    // Fetch media
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
    }, [categories, style, navigate, filteredCategories]);

    // Lightbox handlers
    const openLightbox = useCallback((index) => setLightboxIndex(index), []);
    const closeLightbox = useCallback(() => setLightboxIndex(null), []);
    const prev = useCallback(() => {
        setLightboxIndex((p) => (p === 0 ? galleryItems.length - 1 : p - 1));
    }, [galleryItems.length]);
    const next = useCallback(() => {
        setLightboxIndex((p) => (p === galleryItems.length - 1 ? 0 : p + 1));
    }, [galleryItems.length]);

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

    // Skeleton loader
    const SkeletonGrid = ({ count = 12 }) => (
        <div className={styles.skeleton}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={styles.skeleton__item} />
            ))}
        </div>
    );

    // Card component
    const TattooCard = ({ item, index, category, featured = false }) => {
        const imageUrl = buildMediaSrc(item);
        const isVideo = item.type === "video";
        const thumbSize = featured ? 600 : 400;

        return (
            <article
                className={`${styles.card} ${featured ? styles["card--featured"] : ""}`}
                onClick={() => openLightbox(index)}
            >
                {isVideo ? (
                    <video
                        src={imageUrl}
                        className={styles.card__image}
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        {...thumbnailImageProps(imageUrl, thumbSize)}
                        alt={`Tatouage ${category || styleTitle} - Mystic Tattoo Nancy`}
                        className={styles.card__image}
                        loading="lazy"
                    />
                )}

                <div className={styles.card__overlay}>
                    {category && (
                        <span className={styles.card__category}>{capitalizeFirst(category)}</span>
                    )}
                    <span className={styles.card__title}>Voir en grand</span>
                </div>

                <div className={styles.card__zoom}>
                    <ZoomIcon />
                </div>
            </article>
        );
    };

    // Current item category for lightbox
    const getCurrentCategory = () => {
        if (style) return style;
        if (lightboxIndex === null) return "";

        let count = 0;
        for (const [cat, items] of Object.entries(mediaByCategory)) {
            if (lightboxIndex < count + items.length) {
                return cat;
            }
            count += items.length;
        }
        return "";
    };

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
                {/* Hero Section */}
                <section className={styles.hero}>
                    <span className={styles.hero__badge}>Galerie</span>
                    <h1 className={styles.hero__title}>
                        {style ? (
                            <>Tatouages <span>{styleTitle}</span></>
                        ) : (
                            <>Mes <span>Créations</span></>
                        )}
                    </h1>
                    <p className={styles.hero__subtitle}>
                        {style
                            ? `Découvrez mes réalisations de tatouages ${styleTitle.toLowerCase()}. Chaque pièce est unique et réalisée avec passion.`
                            : `Explorez l'ensemble de mes créations. Du réaliste au japonais, chaque style raconte une histoire unique.`
                        }
                    </p>

                    {!loading && (
                        <div className={styles.hero__stats}>
                            <div className={styles.hero__stat}>
                                <span className={styles.hero__statNumber}>{totalCount}</span>
                                <span className={styles.hero__statLabel}>Créations</span>
                            </div>
                            <div className={styles.hero__stat}>
                                <span className={styles.hero__statNumber}>{categoriesCount}</span>
                                <span className={styles.hero__statLabel}>Styles</span>
                            </div>
                            <div className={styles.hero__stat}>
                                <span className={styles.hero__statNumber}>18+</span>
                                <span className={styles.hero__statLabel}>Années</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Sticky Filters */}
                <nav className={styles.filters}>
                    <div className={styles.filters__container}>
                        <button
                            className={`${styles.filters__btn} ${!style ? styles["filters__btn--active"] : ""}`}
                            onClick={() => navigate("/gallery")}
                        >
                            Tous
                            {!loading && <span className={styles.filters__btnCount}>{totalCount}</span>}
                        </button>

                        {filteredCategories.map((cat) => {
                            const count = mediaByCategory[cat]?.length || 0;
                            if (!style && count === 0) return null;

                            return (
                                <button
                                    key={cat}
                                    className={`${styles.filters__btn} ${style === cat ? styles["filters__btn--active"] : ""}`}
                                    onClick={() => navigate(`/gallery/${cat}`)}
                                >
                                    {capitalizeFirst(cat)}
                                    {!loading && count > 0 && (
                                        <span className={styles.filters__btnCount}>{count}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Content */}
                <main className={styles.content}>
                    {loading ? (
                        <SkeletonGrid count={12} />
                    ) : style ? (
                        // Single category view
                        <>
                            {media.length > 0 ? (
                                <div className={styles.grid}>
                                    {media.map((item, idx) => (
                                        <TattooCard
                                            key={idx}
                                            item={item}
                                            index={idx}
                                            category={style}
                                            featured={idx === 0}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.empty}>
                                    <div className={styles.empty__icon}>🎨</div>
                                    <p className={styles.empty__text}>
                                        Aucun tatouage dans cette catégorie pour le moment.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        // All categories view
                        Object.entries(mediaByCategory).map(([cat, items]) => {
                            if (!items || items.length === 0) return null;

                            const startIndex = Object.entries(mediaByCategory)
                                .slice(0, Object.keys(mediaByCategory).indexOf(cat))
                                .reduce((acc, [, arr]) => acc + arr.length, 0);

                            return (
                                <section key={cat}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionHeader__title}>
                                            {capitalizeFirst(cat)}
                                        </h2>
                                        <span className={styles.sectionHeader__count}>
                                            {items.length} création{items.length > 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    <div className={styles.grid}>
                                        {items.map((item, idx) => (
                                            <TattooCard
                                                key={idx}
                                                item={item}
                                                index={startIndex + idx}
                                                category={cat}
                                                featured={idx === 0}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })
                    )}
                </main>

                {/* Lightbox */}
                {lightboxIndex !== null && galleryItems[lightboxIndex] && (
                    <div className={styles.lightbox} onClick={closeLightbox}>
                        <button className={styles.lightbox__close} onClick={closeLightbox} />

                        <button
                            className={`${styles.lightbox__nav} ${styles["lightbox__nav--prev"]}`}
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                        >
                            &#10094;
                        </button>

                        <div className={styles.lightbox__content} onClick={(e) => e.stopPropagation()}>
                            {galleryItems[lightboxIndex].type === "video" ? (
                                <video
                                    src={buildMediaSrc(galleryItems[lightboxIndex])}
                                    className={styles.lightbox__media}
                                    autoPlay
                                    controls
                                />
                            ) : (
                                <img
                                    src={optimizeCloudinaryUrl(buildMediaSrc(galleryItems[lightboxIndex]), {
                                        width: 1600,
                                        quality: 'auto:good'
                                    })}
                                    alt={`Tatouage ${getCurrentCategory()} - Mystic Tattoo`}
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
                            {lightboxIndex + 1} / {galleryItems.length}
                        </div>

                        {getCurrentCategory() && (
                            <div className={styles.lightbox__info}>
                                {capitalizeFirst(getCurrentCategory())}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Gallery;
