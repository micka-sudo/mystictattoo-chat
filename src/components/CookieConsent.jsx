import React from 'react';
import { createPortal } from 'react-dom';
import { setConsent, useConsent, isAdminSession } from '../lib/consent';
import styles from './CookieConsent.module.scss';

/**
 * Bandeau de consentement : Google Ads n'est chargé qu'après « Accepter ».
 * Refuser est aussi simple qu'accepter (exigence CNIL).
 */
const CookieConsent = () => {
    const consent = useConsent();

    if (consent !== null || isAdminSession()) return null;

    // Rendu dans <body> : un ancêtre transformé casserait le position: fixed
    return createPortal(
        <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Choix des cookies">
            <p className={styles.banner__text}>
                Ce site utilise des cookies Google Ads pour mesurer l'efficacité de ses publicités.
                Ils ne sont déposés qu'avec votre accord. Vous pouvez refuser sans conséquence sur la navigation.
            </p>
            <div className={styles.banner__actions}>
                <button type="button" className={styles.banner__refuse} onClick={() => setConsent('denied')}>
                    Refuser
                </button>
                <button type="button" className={styles.banner__accept} onClick={() => setConsent('granted')}>
                    Accepter
                </button>
            </div>
        </div>,
        document.body
    );
};

export default CookieConsent;
