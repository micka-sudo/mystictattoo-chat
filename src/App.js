import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Reservation from './pages/Reservation';
import Contact from './pages/Contact'; // ✅ ajout manquant
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUpload from './pages/AdminUpload';
import AdminHome from './pages/AdminHome';
import AdminReservations from './pages/AdminReservations';
import RequireAuth from './components/RequireAuth';

/**
 * Définition des routes de l'application.
 * Séparation entre routes publiques et administrateur.
 */
function App() {
    return (
        <Router>
            <Routes>
                {/* =================== PUBLIC =================== */}
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/:style" element={<Gallery />} /> {/* ✅ SEO-friendly */}
                <Route path="/contact" element={<Contact />} />
                <Route path="/reservation" element={<Reservation />} />

                {/* =================== ADMIN PUBLIC =================== */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/home" element={<AdminHome />} />

                {/* =================== ADMIN PRIVÉ =================== */}
                <Route
                    path="/admin"
                    element={
                        <RequireAuth>
                            <AdminUpload />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <RequireAuth>
                            <AdminDashboard />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/reservations"
                    element={
                        <RequireAuth>
                            <AdminReservations />
                        </RequireAuth>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
