import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout'; // ✅ Layout global
import styles from './AdminHome.module.scss'; // ✅ SCSS module

const AdminHome = () => {
    return (
        <Layout>
            <div className={styles.adminHome}>
                <h2>Espace Administrateur</h2>
                <p>Bienvenue dans l'interface d'administration de Mystic Tattoo.</p>

                <div className={styles.adminHome__links}>
                    <Link to="/admin/login" className={styles.adminBtn}>Connexion</Link>
                    <Link to="/admin" className={styles.adminBtn}>Upload</Link>
                    <Link to="/admin/dashboard" className={styles.adminBtn}>Médias</Link>
                </div>
            </div>
        </Layout>
    );
};

export default AdminHome;
