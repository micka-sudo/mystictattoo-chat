import React, { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import styles from "./AdminDashboard.module.scss";
import api, { apiBase } from "../lib/api";

/**
 * Page d'administration :
 * - Gérer les actualités (news)
 * - Gérer les médias (upload / suppression / déplacement de catégorie)
 */
const AdminDashboard = () => {
    const [media, setMedia] = useState([]);
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState("");
    const [filter, setFilter] = useState("all");
    const [moveToCategory, setMoveToCategory] = useState("");
    const [categories, setCategories] = useState([]);

    const [news, setNews] = useState([]);
    const [newsTitle, setNewsTitle] = useState("");
    const [newsContent, setNewsContent] = useState("");
    const [newsImage, setNewsImage] = useState(null);
    const [deletingId, setDeletingId] = useState(null); // anti double-clic

    // Chargement initial
    useEffect(() => {
        fetchMedia();
        fetchNews();
    }, []);

    /**
     * Charge l'ensemble des médias depuis l'API backend.
     * Remplit également la liste des catégories.
     */
    const fetchMedia = async () => {
        try {
            const res = await api.get("/media");
            const items = Array.isArray(res.data) ? res.data : [];
            setMedia(items);

            const cats = Array.from(
                new Set(items.map((m) => m.category).filter(Boolean))
            );
            setCategories(cats);
        } catch (err) {
            console.error("Erreur chargement médias", formatAxiosError(err));
        }
    };

    /**
     * Charge la liste des actualités.
     */
    const fetchNews = async () => {
        try {
            const res = await api.get("/news");
            setNews(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Erreur chargement actualités", formatAxiosError(err));
        }
    };

    /**
     * Upload d'un nouveau média (image ou vidéo).
     * Utilise /media/upload côté backend.
     */
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !category) {
            alert("Fichier et catégorie requis");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        try {
            const res = await api.post("/media/upload", formData);
            setMedia((prev) => [...prev, res.data]);
            setFile(null);
            setCategory("");
        } catch (err) {
            console.error("Erreur upload", formatAxiosError(err));
            alert("Upload impossible");
        }
    };

    /**
     * Suppression d'un média existant.
     * Utilise DELETE /media/:id
     */
    const handleDelete = async (item) => {
        if (!item?._id && !item?.id) {
            alert("ID média manquant");
            return;
        }
        const id = item._id || item.id;

        if (!window.confirm(`Supprimer ${item.filename} ?`)) return;

        try {
            await api.delete(`/media/${encodeURIComponent(id)}`);
            setMedia((prev) => prev.filter((m) => (m._id || m.id) !== id));
        } catch (err) {
            console.error("Erreur suppression média", formatAxiosError(err));
            alert(`Suppression média impossible (${err.response?.status ?? "ERR"})`);
        }
    };

    /**
     * Déplacement d'un média vers une autre catégorie.
     * Utilise PUT /media/:id/move
     */
    const handleMove = async (item) => {
        if (!item?._id && !item?.id) {
            alert("ID média manquant");
            return;
        }
        if (!moveToCategory || moveToCategory === item.category) return;

        const id = item._id || item.id;
        try {
            const res = await api.put(`/media/${encodeURIComponent(id)}/move`, {
                newCategory: moveToCategory,
            });
            const updated = res.data;

            setMedia((prev) =>
                prev.map((m) =>
                    (m._id || m.id) === (updated._id || updated.id) ? updated : m
                )
            );
            setMoveToCategory("");
        } catch (err) {
            console.error("Erreur déplacement", formatAxiosError(err));
            alert(`Déplacement impossible (${err.response?.status ?? "ERR"})`);
        }
    };

    /**
     * Ajout d'une actualité.
     * Utilise POST /news (avec multer côté backend).
     */
    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        if (!newsTitle || !newsContent) {
            alert("Titre et contenu requis");
            return;
        }

        const formData = new FormData();
        formData.append("title", newsTitle);
        formData.append("content", newsContent);
        if (newsImage) {
            formData.append("image", newsImage);
        }

        try {
            const res = await api.post("/news", formData);
            setNews((prev) => [res.data, ...prev]);
            setNewsTitle("");
            setNewsContent("");
            setNewsImage(null);
        } catch (err) {
            console.error("Erreur ajout actu", formatAxiosError(err));
            alert(`Ajout impossible (${err.response?.status ?? "ERR"})`);
        }
    };

    /**
     * Suppression d'une actualité.
     * Utilise DELETE /news/:id
     */
    const handleDeleteNews = async (rawId) => {
        const id = rawId || "";
        if (!id) {
            alert("ID actualité manquant");
            return;
        }
        if (deletingId) return; // éviter double clic
        if (!window.confirm("Supprimer cette actualité ?")) return;

        setDeletingId(id);
        try {
            await api.delete(`/news/${encodeURIComponent(id)}`);
            setNews((prev) => prev.filter((n) => (n._id || n.id) !== id));
        } catch (err) {
            console.error("Erreur suppression actu", formatAxiosError(err));
            alert(`Suppression impossible (${err.response?.status ?? "ERR"})`);
        } finally {
            setDeletingId(null);
        }
    };

    /**
     * Filtrage local des médias par catégorie.
     */
    const filteredMedia =
        filter === "all"
            ? media
            : media.filter((m) => m.category === filter);

    /**
     * Construit l'URL d'affichage d'un média (image/vidéo) :
     * - priorité à Cloudinary (cloudinaryUrl ou cloudUrl)
     * - sinon fallback sur apiBase + path
     */
    const buildMediaSrc = (item) => {
        if (!item) return "";
        const cloud =
            item.cloudinaryUrl || item.cloudUrl || null;

        if (cloud && typeof cloud === "string") {
            return cloud;
        }

        const p = ensureLeadingSlash(item.path || item.url || "");
        return `${apiBase}${p}`;
    };

    /**
     * Construit l'URL d'affichage pour une image d'actualité.
     */
    const buildNewsImageSrc = (image) => {
        if (!image) return "";
        if (typeof image === "string" && image.startsWith("http")) {
            return image;
        }
        const p = ensureLeadingSlash(image);
        return `${apiBase}${p}`;
    };

    return (
        <Layout>
            <div className={styles.adminDashboard}>
                <h2>🎛 Tableau de bord</h2>

                {/* ===================== ACTUALITÉS ===================== */}
                <section className={styles.newsSection}>
                    <h3>📰 Gérer les actualités</h3>

                    <form
                        onSubmit={handleNewsSubmit}
                        className={styles.uploadForm}
                    >
                        <input
                            type="text"
                            placeholder="Titre"
                            value={newsTitle}
                            onChange={(e) => setNewsTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Contenu"
                            rows="3"
                            value={newsContent}
                            onChange={(e) => setNewsContent(e.target.value)}
                            required
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setNewsImage(e.target.files?.[0] || null)
                            }
                        />
                        <button type="submit">➕ Ajouter l’actualité</button>
                    </form>

                    <div className={styles.mediaGrid}>
                        {news.map((item) => {
                            const nid = item._id || item.id;
                            const imgSrc = buildNewsImageSrc(item.image);

                            return (
                                <div key={nid} className={styles.mediaItem}>
                                    <strong>{item.title}</strong>
                                    {imgSrc ? (
                                        <img src={imgSrc} alt={item.title} />
                                    ) : null}
                                    <p>{(item.content || "").slice(0, 100)}…</p>
                                    <button
                                        className={styles.deleteBtn}
                                        disabled={deletingId === nid}
                                        onClick={() => {
                                            console.log("Suppression actu _id =", nid);
                                            handleDeleteNews(nid);
                                        }}
                                    >
                                        {deletingId === nid
                                            ? "Suppression…"
                                            : "🗑 Supprimer"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ===================== MÉDIAS ===================== */}
                <section>
                    <h3>🖼 Gérer les médias</h3>

                    <form
                        onSubmit={handleUpload}
                        className={styles.uploadForm}
                    >
                        <input
                            type="file"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] || null)
                            }
                            required
                        />
                        <input
                            type="text"
                            placeholder="Catégorie (ex: Tattoo noir et blanc)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                        <button type="submit">➕ Ajouter</button>
                    </form>

                    <div className={styles.filterBar}>
                        <label>Filtrer :</label>
                        <select
                            onChange={(e) => setFilter(e.target.value)}
                            value={filter}
                        >
                            <option value="all">Toutes</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.mediaGrid}>
                        {filteredMedia.map((item) => {
                            const mid = item._id || item.id;
                            const src = buildMediaSrc(item);
                            const isImage =
                                item.type === "image" ||
                                /\.(png|jpe?g|webp|gif|avif)$/i.test(
                                    item.path || item.url || ""
                                );

                            return (
                                <div key={mid} className={styles.mediaItem}>
                                    {isImage ? (
                                        <img
                                            src={src}
                                            alt={item.filename}
                                        />
                                    ) : (
                                        <video
                                            src={src}
                                            controls
                                        />
                                    )}

                                    <div className={styles.meta}>
                                        <strong>{item.filename}</strong>
                                        <span className={styles.badge}>
                      {item.category}
                    </span>
                                    </div>

                                    <div className={styles.moveSection}>
                                        <select
                                            value={moveToCategory}
                                            onChange={(e) =>
                                                setMoveToCategory(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Déplacer vers…
                                            </option>
                                            {categories
                                                .filter((c) => c !== item.category)
                                                .map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                        </select>
                                        <button onClick={() => handleMove(item)}>
                                            📦 Déplacer
                                        </button>
                                    </div>

                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(item)}
                                    >
                                        🗑 Supprimer
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </Layout>
    );
};

/**
 * Formate les erreurs Axios pour debug console.
 */
function formatAxiosError(err) {
    return {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
        method: err?.config?.method,
        baseURL: err?.config?.baseURL,
    };
}

/**
 * Ajoute un "/" au début du chemin si absent.
 */
function ensureLeadingSlash(p = "") {
    return p.startsWith("/") ? p : `/${p}`;
}

export default AdminDashboard;
