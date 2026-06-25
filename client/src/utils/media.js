/**
 * Resolve a media path to the correct origin.
 *
 * First-party static assets under /Video/ and /Images/ are deployed to the
 * Vercel static CDN, so they must stay same-origin and never be rewritten to
 * the backend. Only user-uploaded content under /uploads/* is owned by the
 * Express/Render backend and must be routed there when the client runs on a
 * separate origin (VITE_API_URL points at the Render API).
 */
export function getBackendMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Static, CDN-served first-party assets always stay same-origin.
    if (path.startsWith('/Video/') || path.startsWith('/Images/')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))) {
        const backendBase = apiUrl.replace(/\/api\/?$/, '');
        return `${backendBase}${path}`;
    }
    return path;
}
