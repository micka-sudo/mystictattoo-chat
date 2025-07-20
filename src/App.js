import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Reservation from './pages/Reservation';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminReservations from './pages/AdminReservations';
import RequireAuth from './components/RequireAuth';
import Flash from './pages/Flash';

function App() {
    return (
        <Router>
            <Routes>
                {/* =================== PUBLIC =================== */}
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/:style" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route path="/flash" element={<Flash />} />

                {/* =================== ADMIN PUBLIC =================== */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* =================== ADMIN PRIVÉ =================== */}
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
