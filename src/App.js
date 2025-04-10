// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Reservation from './pages/Reservation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUpload from './pages/AdminUpload';
import AdminHome from './pages/AdminHome';
import RequireAuth from './components/RequireAuth';

function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Router>
                <Header />
                <main style={{ flexGrow: 1, overflow: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/reservation" element={<Reservation />} />

                        {/* Routes publiques admin */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/home" element={<AdminHome />} />

                        {/* Routes protégées */}
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
                    </Routes>
                </main>
                <Footer />
            </Router>
        </div>
    );
}

export default App;
