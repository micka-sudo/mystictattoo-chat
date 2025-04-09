// src/pages/Reservation.js
import React, { useState } from 'react';
import axios from 'axios';

function Reservation() {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        date: '',
        message: ''
    });

    const [responseMessage, setResponseMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Remplacez l'URL par celle de votre backend
            const res = await axios.post('http://localhost:5000/api/booking', formData);
            setResponseMessage('Réservation envoyée avec succès !');
            setFormData({
                nom: '',
                email: '',
                date: '',
                message: ''
            });
        } catch (error) {
            setResponseMessage('Erreur lors de l’envoi de la réservation.');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Réservation</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nom :</label>
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email :</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                    <label>Date souhaitée :</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div>
                    <label>Message :</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} />
                </div>
                <button type="submit">Envoyer</button>
            </form>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
}

export default Reservation;
