/**
 * Utility to map product names and variants to their optimized WebP images
 * and fallback JPG/jpg images.
 */

const baseCompressedPath = '/Images';
const baseOriginalPath = '/Images';

// Map of names to their original file extensions (since some are .jpg and some are .JPG)
const originalExtensions = {
  'Alpine Savage': { 1: 'JPG', 2: 'JPG', 3: 'jpg' },
  'Blue Dominion': { 1: 'JPG', 2: 'JPG', 3: 'jpg' },
  'Citrus Reverie': { 1: 'JPG', 2: 'JPG', 3: 'jpg' },
  'Glacier Splash': { 1: 'JPG', 2: 'JPG', 3: 'jpg' },
  'Royal Ascent': { 1: 'JPG', 2: 'JPG', 3: 'jpg' },
  'Swiss Flora': { 1: 'JPG', 2: 'JPG', 3: 'jpg' },
};

/**
 * Gets paths for optimized WebP and original fallback image
 * @param {string} productName - The name of the product (e.g. 'Alpine Savage')
 * @param {number|string} [variant=1] - The variant number (1, 2, or 3)
 * @returns {{webp: string, fallback: string}} Object containing WebP and fallback JPG paths
 */
export function getOptimizedImage(productName, variant = 1) {
  // Clean product name and convert variant to number
  const name = productName ? productName.trim() : '';
  const v = parseInt(variant, 10) || 1;
  
  // Format the base filename. E.g. "Alpine Savage(2)" or "Alpine Savage" (if variant is 1)
  const fileSuffix = v === 1 ? '' : `(${v})`;
  const filenameBase = `${name}${fileSuffix}`;

  // WebP is always .webp
  const webp = `${baseCompressedPath}/${filenameBase}.webp`;

  // Determine original extension
  const productExts = originalExtensions[name];
  const ext = (productExts && productExts[v]) || 'JPG'; // default to JPG
  const fallback = `${baseOriginalPath}/${filenameBase}.${ext}`;

  return {
    webp,
    fallback
  };
}

/**
 * Directly returns the WebP path for a product image
 * @param {string} productName 
 * @param {number|string} variant 
 * @returns {string} WebP image URL path
 */
export function getWebPImage(productName, variant = 1) {
  return getOptimizedImage(productName, variant).webp;
}
