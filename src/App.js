import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Reservation from './pages/Reservation';
import Contact from './pages/Contact';
import Flash from './pages/Flash';
import TattooStyleLanding from './pages/seo/TattooStyleLanding';
import RequireAuth from './components/RequireAuth';
import useVisitTracker from './hooks/useVisitTracker';

// Lazy loading pour les routes admin (chargées uniquement si nécessaire)
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminReservations = lazy(() => import('./pages/AdminReservations'));

// Fallback de chargement pour les composants lazy
const AdminLoader = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--color-background, #1a1a2e)',
        color: 'var(--color-light, #fff)'
    }}>
        Chargement...
    </div>
);

// Composant pour tracker les visites
const VisitTracker = ({ children }) => {
    useVisitTracker();
    return children;
};

function App() {
    return (
        <Router>
            <VisitTracker>
            <Routes>
                {/* =================== PUBLIC =================== */}
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/:style" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route path="/flash" element={<Flash />} />

                {/* =================== SEO LANDING PAGES =================== */}
                <Route path="/tatouage-japonais-nancy" element={<TattooStyleLanding styleKey="japonais" />} />
                <Route path="/tatouage-realiste-nancy" element={<TattooStyleLanding styleKey="realiste" />} />
                <Route path="/tatouage-blackwork-nancy" element={<TattooStyleLanding styleKey="blackwork" />} />
                <Route path="/tatouage-graphique-nancy" element={<TattooStyleLanding styleKey="graphique" />} />
                <Route path="/tatouage-minimaliste-nancy" element={<TattooStyleLanding styleKey="minimaliste" />} />
                <Route path="/tatouage-oldschool-nancy" element={<TattooStyleLanding styleKey="oldschool" />} />

                {/* =================== ADMIN (Lazy Loaded) =================== */}
                <Route path="/admin/login" element={
                    <Suspense fallback={<AdminLoader />}>
                        <AdminLogin />
                    </Suspense>
                } />
                <Route
                    path="/admin/dashboard"
                    element={
                        <Suspense fallback={<AdminLoader />}>
                            <RequireAuth>
                                <AdminDashboard />
                            </RequireAuth>
                        </Suspense>
                    }
                />
                <Route
                    path="/admin/reservations"
                    element={
                        <Suspense fallback={<AdminLoader />}>
                            <RequireAuth>
                                <AdminReservations />
                            </RequireAuth>
                        </Suspense>
                    }
                />
            </Routes>
            </VisitTracker>
        </Router>
    );
}

export default App;
