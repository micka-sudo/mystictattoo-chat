import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './FloatingCTA.module.scss';

const FloatingCTA = () => {
    const location = useLocation();

    // Ne pas afficher sur les pages admin ou reservation
    const hiddenPaths = ['/admin', '/reservation'];
    const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

    if (shouldHide) return null;

    return (
        <Link to="/reservation" className={styles.floatingCta}>
            <span className={styles.floatingCta__text}>Reserver</span>
        </Link>
    );
};

export default FloatingCTA;
