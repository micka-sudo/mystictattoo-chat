import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Home chargé immédiatement (LCP critique)
import Home from './pages/Home';
import RequireAuth from './components/RequireAuth';
import useVisitTracker from './hooks/useVisitTracker';

// Lazy loading pour les routes publiques secondaires
const Gallery = lazy(() => import('./pages/Gallery'));
const Reservation = lazy(() => import('./pages/Reservation'));
const Contact = lazy(() => import('./pages/Contact'));
const Flash = lazy(() => import('./pages/Flash'));
const TattooStyleLanding = lazy(() => import('./pages/seo/TattooStyleLanding'));

// Lazy loading pour les routes admin
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminReservations = lazy(() => import('./pages/AdminReservations'));

// Fallback de chargement pour les composants lazy
const PageLoader = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#1a1a2e',
        color: '#fff'
    }}>
        <div style={{ textAlign: 'center' }}>
            <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 16px' }} />
            <span>Chargement...</span>
        </div>
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
                <Route path="/gallery" element={<Suspense fallback={<PageLoader />}><Gallery /></Suspense>} />
                <Route path="/gallery/:style" element={<Suspense fallback={<PageLoader />}><Gallery /></Suspense>} />
                <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
                <Route path="/reservation" element={<Suspense fallback={<PageLoader />}><Reservation /></Suspense>} />
                <Route path="/flash" element={<Suspense fallback={<PageLoader />}><Flash /></Suspense>} />

                {/* =================== SEO LANDING PAGES =================== */}
                <Route path="/tatouage-japonais-nancy" element={<Suspense fallback={<PageLoader />}><TattooStyleLanding styleKey="japonais" /></Suspense>} />
                <Route path="/tatouage-realiste-nancy" element={<Suspense fallback={<PageLoader />}><TattooStyleLanding styleKey="realiste" /></Suspense>} />
                <Route path="/tatouage-blackwork-nancy" element={<Suspense fallback={<PageLoader />}><TattooStyleLanding styleKey="blackwork" /></Suspense>} />
                <Route path="/tatouage-graphique-nancy" element={<Suspense fallback={<PageLoader />}><TattooStyleLanding styleKey="graphique" /></Suspense>} />
                <Route path="/tatouage-minimaliste-nancy" element={<Suspense fallback={<PageLoader />}><TattooStyleLanding styleKey="minimaliste" /></Suspense>} />
                <Route path="/tatouage-oldschool-nancy" element={<Suspense fallback={<PageLoader />}><TattooStyleLanding styleKey="oldschool" /></Suspense>} />

                {/* =================== ADMIN (Lazy Loaded) =================== */}
                <Route path="/admin/login" element={
                    <Suspense fallback={<PageLoader />}>
                        <AdminLogin />
                    </Suspense>
                } />
                <Route
                    path="/admin/dashboard"
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <RequireAuth>
                                <AdminDashboard />
                            </RequireAuth>
                        </Suspense>
                    }
                />
                <Route
                    path="/admin/reservations"
                    element={
                        <Suspense fallback={<PageLoader />}>
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
