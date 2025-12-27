import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layouts/Layout";
import styles from "./AdminDashboard.module.scss";
import api, { apiBase } from "../lib/api";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const newsImageRef = useRef(null);

    // États principaux
    const [activeTab, setActiveTab] = useState("media");
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Médias
    const [media, setMedia] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Actualités
    const [news, setNews] = useState([]);
    const [newsTitle, setNewsTitle] = useState("");
    const [newsContent, setNewsContent] = useState("");
    const [newsImage, setNewsImage] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Chargement initial
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchMedia(), fetchNews()]);
        setLoading(false);
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
    };

    // ============================================================================
    // MÉDIAS
    // ============================================================================
    const fetchMedia = async () => {
        try {
            const res = await api.get("/media");
            const items = Array.isArray(res.data) ? res.data : [];
            setMedia(items);

            const cats = Array.from(
                new Set(items.map((m) => m.category).filter(Boolean))
            ).sort((a, b) => a.localeCompare(b, "fr"));
            setCategories(cats);
        } catch (err) {
            console.error("Erreur chargement médias", err);
            showToast("Erreur chargement médias", "error");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            showToast("Sélectionnez un fichier", "error");
            return;
        }

        const uploadCategory = customCategory.trim() || selectedCategory;
        if (!uploadCategory) {
            showToast("Choisissez une catégorie", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", uploadCategory);

        try {
            const res = await api.post("/media/upload", formData);
            const created = res.data;

            setMedia((prev) => [...prev, created]);
            setCategories((prevCats) => {
                const next = new Set(prevCats);
                next.add(created.category || uploadCategory);
                return Array.from(next).sort((a, b) => a.localeCompare(b, "fr"));
            });

            setFile(null);
            setSelectedCategory(uploadCategory);
            setCustomCategory("");
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Ouvrir la catégorie où on vient d'ajouter
            setExpandedCategory(uploadCategory);
            showToast("Média uploadé avec succès");
        } catch (err) {
            console.error("Erreur upload", err);
            showToast("Erreur lors de l'upload", "error");
        }
    };

    const handleDelete = async (item) => {
        const id = item._id || item.id;
        if (!id || !window.confirm(`Supprimer ${item.filename} ?`)) return;

        try {
            await api.delete(`/media/${encodeURIComponent(id)}`);
            setMedia((prev) => prev.filter((m) => (m._id || m.id) !== id));
            showToast("Média supprimé");
        } catch (err) {
            console.error("Erreur suppression", err);
            showToast("Erreur lors de la suppression", "error");
        }
    };

    const handleMove = async (item, newCategory) => {
        const id = item._id || item.id;
        if (!id || !newCategory || newCategory === item.category) return;

        try {
            const res = await api.put(`/media/${encodeURIComponent(id)}/move`, {
                newCategory,
            });
            const updated = res.data;

            setMedia((prev) =>
                prev.map((m) =>
                    (m._id || m.id) === (updated._id || updated.id) ? updated : m
                )
            );

            setCategories((prevCats) => {
                const next = new Set(prevCats);
                if (updated.category) next.add(updated.category);
                return Array.from(next).sort((a, b) => a.localeCompare(b, "fr"));
            });

            showToast("Média déplacé");
        } catch (err) {
            console.error("Erreur déplacement", err);
            showToast("Erreur lors du déplacement", "error");
        }
    };

    const toggleCategory = (cat) => {
        setExpandedCategory(expandedCategory === cat ? null : cat);
    };

    const getMediaByCategory = (cat) => {
        return media.filter((m) => m.category === cat);
    };

    // ============================================================================
    // ACTUALITÉS
    // ============================================================================
    const fetchNews = async () => {
        try {
            const res = await api.get("/news");
            setNews(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Erreur chargement actualités", err);
        }
    };

    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        if (!newsTitle || !newsContent) {
            showToast("Titre et contenu requis", "error");
            return;
        }

        const formData = new FormData();
        formData.append("title", newsTitle);
        formData.append("content", newsContent);
        if (newsImage) formData.append("image", newsImage);

        try {
            const res = await api.post("/news", formData);
            setNews((prev) => [res.data, ...prev]);
            setNewsTitle("");
            setNewsContent("");
            setNewsImage(null);
            if (newsImageRef.current) newsImageRef.current.value = "";

            showToast("Actualité ajoutée");
        } catch (err) {
            console.error("Erreur ajout actu", err);
            showToast("Erreur lors de l'ajout", "error");
        }
    };

    const handleDeleteNews = async (id) => {
        if (!id || deletingId || !window.confirm("Supprimer cette actualité ?")) return;

        setDeletingId(id);
        try {
            await api.delete(`/news/${encodeURIComponent(id)}`);
            setNews((prev) => prev.filter((n) => (n._id || n.id) !== id));
            showToast("Actualité supprimée");
        } catch (err) {
            console.error("Erreur suppression actu", err);
            showToast("Erreur lors de la suppression", "error");
        } finally {
            setDeletingId(null);
        }
    };

    // ============================================================================
    // HELPERS
    // ============================================================================
    const buildMediaSrc = (item) => {
        if (!item) return "";
        const cloud = item.cloudinaryUrl || item.cloudUrl;
        if (cloud && typeof cloud === "string") return cloud;
        const p = ensureLeadingSlash(item.path || item.url || "");
        return `${apiBase}${p}`;
    };

    const buildNewsImageSrc = (image) => {
        if (!image) return "";
        if (typeof image === "string" && image.startsWith("http")) return image;
        return `${apiBase}${ensureLeadingSlash(image)}`;
    };

    const isImage = (item) =>
        item.type === "image" ||
        /\.(png|jpe?g|webp|gif|avif)$/i.test(item.path || item.url || "");

    // ============================================================================
    // RENDER
    // ============================================================================
    if (loading) {
        return (
            <Layout>
                <div className={styles.adminDashboard}>
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.adminDashboard}>
                {/* Header */}
                <div className={styles.header}>
                    <h2>Tableau de bord</h2>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Déconnexion
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className={styles.tabNav}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "media" ? styles.active : ""}`}
                        onClick={() => setActiveTab("media")}
                    >
                        <span>Médias</span>
                        <span className={styles.tabCount}>{media.length}</span>
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "news" ? styles.active : ""}`}
                        onClick={() => setActiveTab("news")}
                    >
                        <span>Actualités</span>
                        <span className={styles.tabCount}>{news.length}</span>
                    </button>
                </div>

                {/* Section Médias */}
                {activeTab === "media" && (
                    <div className={styles.section}>
                        {/* Formulaire Upload */}
                        <form onSubmit={handleUpload} className={styles.uploadForm}>
                            <h3>Ajouter un média</h3>

                            <div className={styles.fileInput}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="mediaFile"
                                    accept="image/*,video/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <label
                                    htmlFor="mediaFile"
                                    className={`${styles.fileLabel} ${file ? styles.hasFile : ""}`}
                                >
                                    {file ? `${file.name}` : "Choisir un fichier"}
                                </label>
                            </div>

                            <div className={styles.categoryPicker}>
                                <div className={styles.categoryColumn}>
                                    <label>Catégorie existante</label>
                                    <select
                                        className={styles.select}
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">Choisir...</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <span className={styles.orDivider}>ou</span>

                                <div className={styles.categoryColumn}>
                                    <label>Nouvelle catégorie</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Ex: Réaliste"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" className={styles.btnPrimary}>
                                Ajouter le média
                            </button>
                        </form>

                        {/* Liste des catégories en accordéon */}
                        <div className={styles.categoryList}>
                            {categories.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>📁</div>
                                    <p>Aucune catégorie</p>
                                </div>
                            ) : (
                                categories.map((cat) => {
                                    const catMedia = getMediaByCategory(cat);
                                    const isExpanded = expandedCategory === cat;
                                    const firstMedia = catMedia[0];
                                    const thumbSrc = firstMedia ? buildMediaSrc(firstMedia) : null;

                                    return (
                                        <div key={cat} className={styles.categoryAccordion}>
                                            {/* Header de catégorie cliquable */}
                                            <button
                                                className={`${styles.categoryHeader} ${isExpanded ? styles.expanded : ""}`}
                                                onClick={() => toggleCategory(cat)}
                                            >
                                                <div className={styles.categoryThumb}>
                                                    {thumbSrc ? (
                                                        <img src={thumbSrc} alt={cat} />
                                                    ) : (
                                                        <div className={styles.noThumb}>📷</div>
                                                    )}
                                                </div>
                                                <div className={styles.categoryInfo}>
                                                    <span className={styles.categoryName}>{cat}</span>
                                                    <span className={styles.categoryCount}>
                                                        {catMedia.length} média{catMedia.length > 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <span className={styles.chevron}>
                                                    {isExpanded ? "▼" : "▶"}
                                                </span>
                                            </button>

                                            {/* Contenu déplié */}
                                            {isExpanded && (
                                                <div className={styles.categoryContent}>
                                                    <div className={styles.mediaGrid}>
                                                        {catMedia.map((item) => {
                                                            const mid = item._id || item.id;
                                                            const src = buildMediaSrc(item);

                                                            return (
                                                                <div key={mid} className={styles.mediaItem}>
                                                                    <div className={styles.mediaPreview}>
                                                                        {isImage(item) ? (
                                                                            <img src={src} alt={item.filename} loading="lazy" />
                                                                        ) : (
                                                                            <video src={src} muted playsInline />
                                                                        )}
                                                                    </div>

                                                                    <div className={styles.mediaContent}>
                                                                        <div className={styles.meta}>
                                                                            <strong>{item.filename}</strong>
                                                                        </div>

                                                                        <div className={styles.mediaActions}>
                                                                            <div className={styles.moveSection}>
                                                                                <select
                                                                                    defaultValue=""
                                                                                    onChange={(e) => {
                                                                                        if (e.target.value) {
                                                                                            handleMove(item, e.target.value);
                                                                                            e.target.value = "";
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <option value="">Déplacer...</option>
                                                                                    {categories
                                                                                        .filter((c) => c !== item.category)
                                                                                        .map((c) => (
                                                                                            <option key={c} value={c}>{c}</option>
                                                                                        ))}
                                                                                </select>
                                                                            </div>

                                                                            <button
                                                                                className={styles.deleteBtn}
                                                                                onClick={() => handleDelete(item)}
                                                                            >
                                                                                Supprimer
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Section Actualités */}
                {activeTab === "news" && (
                    <div className={styles.section}>
                        {/* Formulaire Actualité */}
                        <form onSubmit={handleNewsSubmit} className={styles.uploadForm}>
                            <h3>Ajouter une actualité</h3>

                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Titre"
                                value={newsTitle}
                                onChange={(e) => setNewsTitle(e.target.value)}
                            />

                            <textarea
                                className={styles.textarea}
                                placeholder="Contenu de l'actualité..."
                                value={newsContent}
                                onChange={(e) => setNewsContent(e.target.value)}
                            />

                            <div className={styles.fileInput}>
                                <input
                                    ref={newsImageRef}
                                    type="file"
                                    id="newsImage"
                                    accept="image/*"
                                    onChange={(e) => setNewsImage(e.target.files?.[0] || null)}
                                />
                                <label
                                    htmlFor="newsImage"
                                    className={`${styles.fileLabel} ${newsImage ? styles.hasFile : ""}`}
                                >
                                    {newsImage ? newsImage.name : "Image (optionnel)"}
                                </label>
                            </div>

                            <button type="submit" className={styles.btnPrimary}>
                                Publier l'actualité
                            </button>
                        </form>

                        {/* Liste Actualités */}
                        {news.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📰</div>
                                <p>Aucune actualité</p>
                            </div>
                        ) : (
                            <div className={styles.newsGrid}>
                                {news.map((item) => {
                                    const nid = item._id || item.id;
                                    const imgSrc = buildNewsImageSrc(item.image);

                                    return (
                                        <div key={nid} className={styles.newsItem}>
                                            {imgSrc && <img src={imgSrc} alt={item.title} />}
                                            <div className={styles.newsContent}>
                                                <strong>{item.title}</strong>
                                                <p>{(item.content || "").slice(0, 100)}...</p>
                                                <button
                                                    className={styles.deleteBtn}
                                                    disabled={deletingId === nid}
                                                    onClick={() => handleDeleteNews(nid)}
                                                >
                                                    {deletingId === nid ? "Suppression..." : "Supprimer"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className={`${styles.toast} ${styles[toast.type]}`}>
                        {toast.message}
                    </div>
                )}
            </div>
        </Layout>
    );
};

function ensureLeadingSlash(p = "") {
    return p.startsWith("/") ? p : `/${p}`;
}

export default AdminDashboard;