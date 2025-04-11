import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.scss'; // ✅ Import global
import styles from './Layout.module.scss'; // ton style spécifique

const Layout = ({ children }) => {
    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.main}>{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
