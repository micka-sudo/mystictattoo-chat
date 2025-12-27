import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCTA from '../components/FloatingCTA';
import '../styles/main.scss'; // ✅ Import global
import styles from './Layout.module.scss'; // ton style spécifique

const Layout = ({ children }) => {
    return (
        <div className={styles.layout}>
            {/* Skip to main content - Accessibilité */}
            <a href="#main-content" className={styles.skipLink}>
                Aller au contenu principal
            </a>
            <Header />
            <main id="main-content" className={styles.main} tabIndex="-1">
                {children}
            </main>
            <Footer />
            <FloatingCTA />
        </div>
    );
};

export default Layout;
