import crypto from 'crypto';

/**
 * Shared Razorpay HMAC-SHA256 signature verifier.
 *
 * Recomputes the expected signature for `${orderId}|${paymentId}` using the
 * Razorpay key secret and compares it against the client-supplied signature
 * using a constant-time comparison. Hardened against malformed (non-hex or
 * wrong-length) signatures so a bad input can never throw.
 *
 * @param {Object}  params
 * @param {string}  params.razorpay_order_id
 * @param {string}  params.razorpay_payment_id
 * @param {string}  params.razorpay_signature
 * @param {string}  params.keySecret  RAZORPAY_KEY_SECRET
 * @returns {boolean} true only when the signature is valid.
 */
export const verifyRazorpaySignature = ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    keySecret,
}) => {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !keySecret) {
        return false;
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

    return safeCompareHex(expectedSignature, razorpay_signature);
};

/**
 * Constant-time comparison of two hex-encoded strings. Returns false (instead
 * of throwing) when the candidate is not valid hex or the lengths differ.
 * `Buffer.from('zz', 'hex')` silently drops invalid chars, so an explicit hex
 * shape check is required before comparing buffers.
 *
 * @param {string} expectedHex
 * @param {string} candidateHex
 * @returns {boolean}
 */
export const safeCompareHex = (expectedHex, candidateHex) => {
    if (typeof candidateHex !== 'string' || !/^[0-9a-fA-F]+$/.test(candidateHex)) {
        return false;
    }

    const expBuf = Buffer.from(expectedHex, 'hex');
    const candBuf = Buffer.from(candidateHex, 'hex');

    if (expBuf.length !== candBuf.length) {
        return false;
    }

    return crypto.timingSafeEqual(expBuf, candBuf);
};

export default verifyRazorpaySignature;
