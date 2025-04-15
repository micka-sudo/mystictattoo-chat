import React, { useState } from 'react';
import Layout from '../layouts/Layout';
import styles from './Reservation.module.scss';
import api from '../lib/api';

const Reservation = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        date: '',
        message: ''
    });

    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('⏳ Envoi de la demande...');

        try {
            const res = await api.post('/reservations', form);
            if (res.status === 201) {
                setStatus('✅ Réservation envoyée avec succès !');
                setForm({ name: '', email: '', date: '', message: '' });
            } else {
                setStatus('❌ Une erreur est survenue.');
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Erreur serveur lors de la réservation');
        }
    };

    return (
        <Layout>
            <div className={styles.reservation}>
                <h2>📅 Réserver un créneau</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Votre nom"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Votre email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="message"
                        placeholder="Votre message (optionnel)"
                        value={form.message}
                        onChange={handleChange}
                        rows={4}
                    />
                    <button type="submit">Envoyer la demande</button>
                </form>

                {status && <p className={styles.status}>{status}</p>}
            </div>
        </Layout>
    );
};

export default Reservation;
