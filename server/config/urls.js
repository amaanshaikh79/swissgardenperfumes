/**
 * Public URL resolution — zero-config on Render.
 *
 * Render automatically injects RENDER_EXTERNAL_URL (e.g.
 * https://swissgardenperfumes.onrender.com) into every web service. We use it
 * as the fallback so a default Render deploy works WITHOUT manually setting
 * CLIENT_URL, SERVER_URL, or the OAuth callback URLs.
 *
 * Explicit env vars always win, so a custom domain (CLIENT_URL=
 * https://swissgardenperfumes.com) or a split frontend/backend deploy still
 * behaves exactly as configured.
 *
 * This single Render service serves both the React client and the API from one
 * origin, so client and server URLs are normally identical; they are kept as
 * separate getters for the split-deploy case.
 */

const stripTrailingSlash = (url) => (url ? url.replace(/\/+$/, '') : url);

/** Origin the browser loads the app from (used for redirects + CORS). */
export const getClientUrl = () =>
    stripTrailingSlash(process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL) ||
    'http://localhost:5173';

/** Origin the API is reachable at (used to build absolute OAuth callbacks). */
export const getServerUrl = () =>
    stripTrailingSlash(
        process.env.SERVER_URL ||
        process.env.RENDER_EXTERNAL_URL ||
        process.env.CLIENT_URL
    ) || 'http://localhost:5000';

/** Absolute OAuth callback URL for a provider, derived from the server origin. */
export const getOAuthCallbackUrl = (provider) =>
    `${getServerUrl()}/api/auth/${provider}/callback`;

/** De-duplicated list of trusted browser origins for the CORS allowlist. */
export const getAllowedOrigins = () =>
    [
        process.env.CLIENT_URL,
        process.env.RENDER_EXTERNAL_URL,
        'http://localhost:5173',
    ]
        .filter(Boolean)
        .map((origin) => origin.replace(/\/+$/, ''));
