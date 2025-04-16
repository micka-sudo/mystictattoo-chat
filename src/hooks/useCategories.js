import { useState, useEffect } from 'react';
import api from '../lib/api';

const useCategories = () => {
    const [categories, setCategories] = useState([]); // ✅ toujours un tableau

    const fetchCategories = async () => {
        try {
            const res = await api.get('/media/categories');
            const filtered = res.data.filter(c => c !== 'actus');
            setCategories(filtered);
        } catch (err) {
            console.error('Erreur chargement catégories', err);
            setCategories([]); // 🔐 fallback
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, refreshCategories: fetchCategories };
};

export default useCategories; // ✅ default export
