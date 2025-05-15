import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Récupère les catégories contenant au moins un média image ou vidéo
 */
const useCategories = () => {
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/media/categories-with-content');
            const filtered = res.data.filter(c => c !== 'actus');
            setCategories(filtered);
        } catch (err) {
            console.error('Erreur chargement catégories', err);
            setCategories([]);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, refreshCategories: fetchCategories };
};

export default useCategories;
