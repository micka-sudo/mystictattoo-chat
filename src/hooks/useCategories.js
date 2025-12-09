import { useState, useEffect } from "react";
import api from "../lib/api";

/**
 * Hook pour récupérer les catégories disponibles
 * - Source principale : /media/categories-with-content
 * - Fallback       : /media (reconstruction des catégories)
 */
const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("useCategories ▶️ Appel /media/categories-with-content");
            const res = await api.get("/media/categories-with-content");

            let raw = Array.isArray(res.data) ? res.data : [];

            console.log(
                "useCategories ▶️ Réponse brute de /media/categories-with-content :",
                raw
            );

            // Si l’API renvoie un tableau vide → fallback sur /media
            if (!raw.length) {
                console.warn(
                    "useCategories ⚠️ Tableau vide. Fallback sur /media."
                );

                const mediaRes = await api.get("/media");
                const media = Array.isArray(mediaRes.data) ? mediaRes.data : [];

                raw = [
                    ...new Set(
                        media
                            .map((m) => m.category)
                            .filter((c) => typeof c === "string" && c.trim().length > 0)
                    ),
                ];
            }

            // Retire ACTUS
            const filtered = raw.filter(
                (c) => c && typeof c === "string" && c.toLowerCase() !== "actus"
            );

            console.log("useCategories ✅ Catégories finales :", filtered);

            setCategories(filtered);
        } catch (err) {
            console.error("useCategories ❌ Erreur chargement catégories :", err);
            setError(err);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        categories,
        loading,
        error,
        refreshCategories: fetchCategories,
    };
};

export default useCategories;
