import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Reservation from './pages/Reservation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUpload from './pages/AdminUpload';
import AdminHome from './pages/AdminHome';
import AdminReservations from './pages/AdminReservations'; // ✅ AJOUT
import RequireAuth from './components/RequireAuth';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/reservation" element={<Reservation />} />

                {/* Admin public */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/home" element={<AdminHome />} />

                {/* Admin protégé */}
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
                    path="/admin/reservations" // ✅ NOUVELLE ROUTE
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
