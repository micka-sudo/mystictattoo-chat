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
    const [files, setFiles] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, filename: "" });

    // Actualités
    const [news, setNews] = useState([]);
    const [newsTitle, setNewsTitle] = useState("");
    const [newsContent, setNewsContent] = useState("");
    const [newsImage, setNewsImage] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Statistiques
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Synchronisation Cloudinary
    const [syncing, setSyncing] = useState(false);
    const [syncResults, setSyncResults] = useState(null);

    // Chargement initial
    useEffect(() => {
        loadData();
    }, []);

    // Charger les stats quand on ouvre l'onglet
    useEffect(() => {
        if (activeTab === "stats" && !stats) {
            fetchStats();
        }
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchMedia(), fetchNews()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await api.get("/stats");
            setStats(res.data);
        } catch (err) {
            console.error("Erreur chargement stats", err);
            showToast("Erreur chargement statistiques", "error");
        } finally {
            setStatsLoading(false);
        }
    };

    const syncCloudinary = async (force = false) => {
        setSyncing(true);
        setSyncResults(null);
        try {
            const url = force ? "/media/sync?force=true" : "/media/sync";
            const res = await api.post(url);
            setSyncResults(res.data.results);
            showToast(`Synchronisation terminée: ${res.data.results.added} ajoutés`, "success");
            // Recharger les médias
            await fetchMedia();
        } catch (err) {
            console.error("Erreur synchronisation", err);
            showToast("Erreur synchronisation Cloudinary", "error");
        } finally {
            setSyncing(false);
        }
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
            // Charger tous les médias (limit=1000 pour éviter la pagination)
            const res = await api.get("/media?limit=1000");
            const items = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setMedia(items);

            const cats = Array.from(
                new Set(items.map((m) => m.category).filter(Boolean))
            ).sort((a, b) => a.localeCompare(b, "fr"));

            // Toujours inclure "Accueil" en premier (pour la homepage)
            const accueilFirst = ["Accueil", ...cats.filter((c) => c !== "Accueil")];
            setCategories(accueilFirst);
        } catch (err) {
            console.error("Erreur chargement médias", err);
            showToast("Erreur chargement médias", "error");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            showToast("Sélectionnez au moins un fichier", "error");
            return;
        }

        const uploadCategory = customCategory.trim() || selectedCategory;
        if (!uploadCategory) {
            showToast("Choisissez une catégorie", "error");
            return;
        }

        setUploading(true);
        setUploadProgress({ current: 0, total: files.length, filename: "" });

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress({ current: i + 1, total: files.length, filename: file.name });

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
                successCount++;
            } catch (err) {
                console.error(`Erreur upload ${file.name}`, err);
                errorCount++;
            }
        }

        // Reset form
        setFiles([]);
        setSelectedCategory(uploadCategory);
        setCustomCategory("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        // Ouvrir la catégorie où on vient d'ajouter
        setExpandedCategory(uploadCategory);
        setUploading(false);
        setUploadProgress({ current: 0, total: 0, filename: "" });

        // Message récapitulatif
        if (errorCount === 0) {
            showToast(`${successCount} fichier${successCount > 1 ? "s" : ""} uploadé${successCount > 1 ? "s" : ""} avec succès !`, "success");
        } else {
            showToast(`${successCount} réussi${successCount > 1 ? "s" : ""}, ${errorCount} erreur${errorCount > 1 ? "s" : ""}`, "error");
        }
    };

    const removeFileFromList = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
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
                    <button
                        className={`${styles.tabBtn} ${activeTab === "stats" ? styles.active : ""}`}
                        onClick={() => setActiveTab("stats")}
                    >
                        <span>Statistiques</span>
                    </button>
                </div>

                {/* Section Médias */}
                {activeTab === "media" && (
                    <div className={styles.section}>
                        {/* Formulaire Upload */}
                        <form onSubmit={handleUpload} className={styles.uploadForm}>
                            <h3>Ajouter des médias</h3>

                            <div className={styles.fileInput}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="mediaFile"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={(e) => {
                                        const newFiles = Array.from(e.target.files || []);
                                        setFiles((prev) => [...prev, ...newFiles]);
                                    }}
                                />
                                <label
                                    htmlFor="mediaFile"
                                    className={`${styles.fileLabel} ${files.length > 0 ? styles.hasFile : ""}`}
                                >
                                    {files.length > 0
                                        ? `${files.length} fichier${files.length > 1 ? "s" : ""} sélectionné${files.length > 1 ? "s" : ""}`
                                        : "Choisir des fichiers"}
                                </label>
                            </div>

                            {/* Liste des fichiers sélectionnés */}
                            {files.length > 0 && (
                                <div className={styles.fileList}>
                                    {files.map((f, idx) => (
                                        <div key={`${f.name}-${idx}`} className={styles.fileListItem}>
                                            <span className={styles.fileName}>{f.name}</span>
                                            <button
                                                type="button"
                                                className={styles.removeFileBtn}
                                                onClick={() => removeFileFromList(idx)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

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

                            <button
                                type="submit"
                                className={styles.btnPrimary}
                                disabled={uploading || files.length === 0}
                            >
                                {uploading
                                    ? `Upload ${uploadProgress.current}/${uploadProgress.total}...`
                                    : `Ajouter ${files.length > 0 ? files.length : "les"} média${files.length > 1 ? "s" : ""}`}
                            </button>

                            {/* Barre de progression */}
                            {uploading && uploadProgress.total > 0 && (
                                <div className={styles.uploadProgressContainer}>
                                    <div className={styles.uploadProgressBar}>
                                        <div
                                            className={styles.uploadProgressFill}
                                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className={styles.uploadProgressText}>
                                        {uploadProgress.filename}
                                    </span>
                                </div>
                            )}
                        </form>

                        {/* Synchronisation Cloudinary */}
                        <div className={styles.syncSection}>
                            <div className={styles.syncInfo}>
                                <h4>Synchronisation Cloudinary</h4>
                                <p>Importer les images existantes de Cloudinary vers la base de données</p>
                            </div>
                            <div className={styles.syncButtons}>
                                <button
                                    className={styles.btnSecondary}
                                    onClick={() => syncCloudinary(false)}
                                    disabled={syncing}
                                >
                                    {syncing ? "Sync..." : "Synchroniser"}
                                </button>
                                <button
                                    className={styles.btnDanger}
                                    onClick={() => {
                                        if (window.confirm("Réimporter TOUTES les images de Cloudinary ?")) {
                                            syncCloudinary(true);
                                        }
                                    }}
                                    disabled={syncing}
                                >
                                    Forcer sync
                                </button>
                            </div>
                            {syncResults && (
                                <div className={styles.syncResults}>
                                    <span className={styles.syncAdded}>+{syncResults.added} ajoutés</span>
                                    <span className={styles.syncSkipped}>{syncResults.skipped} existants</span>
                                </div>
                            )}
                        </div>

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
                                                    <span className={styles.categoryName}>
                                                        {cat}
                                                        {cat === "Accueil" && (
                                                            <span className={styles.categoryBadge}>Page d'accueil</span>
                                                        )}
                                                    </span>
                                                    <span className={styles.categoryCount}>
                                                        {catMedia.length} média{catMedia.length > 1 ? "s" : ""}
                                                        {cat === "Accueil" && catMedia.length === 0 && " - Ajoutez des images ici"}
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

                {/* Section Statistiques */}
                {activeTab === "stats" && (
                    <div className={styles.section}>
                        <div className={styles.statsHeader}>
                            <h3>Statistiques de fréquentation</h3>
                            <button
                                className={styles.btnSecondary}
                                onClick={fetchStats}
                                disabled={statsLoading}
                            >
                                {statsLoading ? "Chargement..." : "Actualiser"}
                            </button>
                        </div>

                        {statsLoading && !stats ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                            </div>
                        ) : stats ? (
                            <>
                                {/* Résumé */}
                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statValue}>{stats.summary.today}</div>
                                        <div className={styles.statLabel}>Aujourd'hui</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statValue}>{stats.summary.week}</div>
                                        <div className={styles.statLabel}>Cette semaine</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statValue}>{stats.summary.month}</div>
                                        <div className={styles.statLabel}>Ce mois</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statValue}>{stats.summary.uniqueVisitors}</div>
                                        <div className={styles.statLabel}>Visiteurs uniques</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statValue}>{stats.summary.total}</div>
                                        <div className={styles.statLabel}>Total visites</div>
                                    </div>
                                </div>

                                {/* Pages les plus visitées */}
                                <div className={styles.statsSection}>
                                    <h4>Pages les plus visitées</h4>
                                    {stats.topPages.length === 0 ? (
                                        <p className={styles.noData}>Aucune donnée</p>
                                    ) : (
                                        <div className={styles.topPagesList}>
                                            {stats.topPages.map((page, idx) => (
                                                <div key={page._id} className={styles.topPageItem}>
                                                    <span className={styles.pageRank}>#{idx + 1}</span>
                                                    <span className={styles.pagePath}>{page._id}</span>
                                                    <span className={styles.pageCount}>{page.count} visites</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Répartition par appareil */}
                                <div className={styles.statsSection}>
                                    <h4>Appareils</h4>
                                    <div className={styles.deviceStats}>
                                        {stats.deviceStats.map((device) => (
                                            <div key={device._id} className={styles.deviceItem}>
                                                <span className={styles.deviceIcon}>
                                                    {device._id === 'mobile' ? '📱' : device._id === 'tablet' ? '📲' : '💻'}
                                                </span>
                                                <span className={styles.deviceName}>
                                                    {device._id === 'mobile' ? 'Mobile' : device._id === 'tablet' ? 'Tablette' : 'Desktop'}
                                                </span>
                                                <span className={styles.deviceCount}>{device.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Répartition par navigateur */}
                                <div className={styles.statsSection}>
                                    <h4>Navigateurs</h4>
                                    <div className={styles.browserStats}>
                                        {stats.browserStats.map((browser) => (
                                            <div key={browser._id} className={styles.browserItem}>
                                                <span className={styles.browserName}>{browser._id || 'Inconnu'}</span>
                                                <span className={styles.browserCount}>{browser.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Graphique des visites par jour */}
                                <div className={styles.statsSection}>
                                    <h4>Visites par jour (30 derniers jours)</h4>
                                    {stats.dailyVisits.length === 0 ? (
                                        <p className={styles.noData}>Aucune donnée</p>
                                    ) : (
                                        <div className={styles.dailyChart}>
                                            {stats.dailyVisits.map((day) => {
                                                const maxCount = Math.max(...stats.dailyVisits.map(d => d.count));
                                                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                                                return (
                                                    <div key={day._id} className={styles.dailyBar} title={`${day._id}: ${day.count} visites`}>
                                                        <div
                                                            className={styles.dailyBarFill}
                                                            style={{ height: `${height}%` }}
                                                        />
                                                        <span className={styles.dailyDate}>{day._id.slice(-2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📊</div>
                                <p>Aucune statistique disponible</p>
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