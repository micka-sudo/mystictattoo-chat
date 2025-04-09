// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [reservations, setReservations] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                // Remplacez l'URL par celle de votre backend.
                const res = await axios.get('http://localhost:5000/api/booking');
                setReservations(res.data);
            } catch (error) {
                setErrorMessage("Erreur lors du chargement des réservations.");
                console.error(error);
            }
        };

        fetchReservations();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/booking/${id}`, { status: newStatus });
            setReservations((prevReservations) =>
                prevReservations.map((booking) =>
                    booking._id === id ? { ...booking, status: newStatus } : booking
                )
            );
        } catch (error) {
            console.error("Erreur lors de la mise à jour", error);
        }
    };

    return (
        <div>
            <h2>Tableau de bord Administrateur</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <h3>Réservations :</h3>
            {reservations.length === 0 ? (
                <p>Aucune réservation disponible.</p>
            ) : (
                <ul>
                    {reservations.map((booking) => (
                        <li key={booking._id}>
                            <strong>{booking.nom}</strong> - {new Date(booking.date).toLocaleDateString()} - Statut: {booking.status}
                            <div>
                                <button onClick={() => handleUpdateStatus(booking._id, 'Acceptée')}>Accepter</button>
                                <button onClick={() => handleUpdateStatus(booking._id, 'Refusée')}>Refuser</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {/* Vous pouvez ajouter ici un formulaire pour uploader des images ou gérer la galerie */}
        </div>
    );
}

export default AdminDashboard;
