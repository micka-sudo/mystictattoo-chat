import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'admin_token';
// Tolérance d'horloge pour un iat légèrement dans le futur
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Renvoie le payload d'un token admin encore utilisable, sinon null.
 * Les anciens tokens (iat en millisecondes, expiration en l'an 58000)
 * sont refusés par l'API : on les écarte aussi ici.
 */
export const decodeUsableToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        const now = Date.now();
        if (typeof decoded.exp !== 'number' || decoded.exp * 1000 <= now) return null;
        if (typeof decoded.iat !== 'number' || decoded.iat * 1000 > now + CLOCK_SKEW_MS) return null;
        return decoded;
    } catch {
        return null;
    }
};

export const clearAdminToken = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {
        // Stockage indisponible
    }
};
