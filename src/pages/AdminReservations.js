import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './AdminReservations.module.scss';
import api from '../lib/api';

const AdminReservations = () => {
    const [reservations, setReservations] = useState([]);

    const fetchData = async () => {
        try {
            const res = await api.get('/reservations');
            setReservations(res.data.reverse());
        } catch (err) {
            console.error('Erreur chargement réservations', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await api.put(`/reservations/${id}`, { status });
            if (res.status === 200) {
                fetchData(); // Recharge les données
            }
        } catch (err) {
            console.error('Erreur mise à jour statut', err);
        }
    };

    return (
        <Layout>
            <div className={styles.adminReservations}>
                <h2>📋 Réservations reçues</h2>
                {reservations.length === 0 ? (
                    <p>Aucune réservation pour le moment.</p>
                ) : (
                    <ul className={styles.list}>
                        {reservations.map((item) => (
                            <li key={item.id} className={styles.item}>
                                <strong>{item.name}</strong> — {item.email}<br />
                                📅 {item.date}<br />
                                <em>Status : {item.status}</em><br />
                                {item.message && <p>{item.message}</p>}
                                {item.status === 'en attente' && (
                                    <div className={styles.actions}>
                                        <button onClick={() => updateStatus(item.id, 'acceptée')}>✅ Accepter</button>
                                        <button onClick={() => updateStatus(item.id, 'refusée')}>❌ Refuser</button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Layout>
    );
};

export default AdminReservations;
