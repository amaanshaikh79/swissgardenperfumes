import { escapeHTML } from './sendEmail.js';
import { getClientUrl } from '../config/urls.js';

/**
 * Transactional email templates.
 *
 * Every template returns a full HTML string wrapped in the shared brand layout
 * (dark #0a0a0a background, gold #D4AF37 accents, 600px single column) that
 * matches the existing orderConfirmationEmail in sendEmail.js. All
 * user-controlled values pass through escapeHTML; all links are built from
 * getClientUrl() so they work in local, Render-default, and custom-domain
 * deploys without code changes.
 */

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);

const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

const ctaButton = (href, label) => `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${href}" style="display: inline-block; padding: 14px 36px; background: #D4AF37; color: #0a0a0a; text-decoration: none; font-weight: bold; letter-spacing: 1px; border-radius: 4px;">${label}</a>
    </div>`;

const baseLayout = (contentHtml) => `
    <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; font-family: 'Georgia', serif;">
      <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%);">
        <h1 style="color: #D4AF37; font-size: 28px; margin: 0; letter-spacing: 4px;">SwissGarden</h1>
        <p style="color: #999; font-size: 12px; letter-spacing: 6px; margin-top: 8px;">PERFUMES</p>
      </div>

      <div style="padding: 40px 30px;">${contentHtml}</div>

      <div style="text-align: center; padding: 30px; background: #111; border-top: 1px solid #333;">
        <p style="color: #999; font-size: 12px; margin: 0 0 8px;">Questions? We are here to help.</p>
        <p style="color: #999; font-size: 12px; margin: 0;">
          <a href="mailto:support@swissgardenperfumes.com" style="color: #D4AF37; text-decoration: none;">support@swissgardenperfumes.com</a>
          &nbsp;•&nbsp; +91 9354936369
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 16px;">© 2025 SwissGarden Perfumes. All rights reserved.</p>
        <p style="color: #666; font-size: 11px; margin-top: 8px;">Crafted with passion for the discerning connoisseur.</p>
      </div>
    </div>`;

const orderItemsTable = (order) => `
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #D4AF37;">
              <th style="padding: 12px; text-align: left; color: #D4AF37;">Item</th>
              <th style="padding: 12px; text-align: center; color: #D4AF37;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #D4AF37;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${(order.orderItems || [])
                .map(
                    (item) => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #333; color: #ccc;">${escapeHTML(item.name)}${item.size ? `<br><small style="color: #999;">${escapeHTML(item.size)}</small>` : ''}</td>
              <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center; color: #ccc;">${item.quantity}</td>
              <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; color: #D4AF37;">${formatINR(item.price)}</td>
            </tr>`
                )
                .join('')}
          </tbody>
        </table>`;

// ─── Auth ─────────────────────────────────────────────────────────

export const welcomeEmail = (user) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Welcome to SwissGarden ✨</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          Your account has been created. Welcome to the world of premium, non-alcoholic
          roll-on attars — crafted for the Indian climate and made to last 8–12 hours.
        </p>
        <p style="color: #ccc; line-height: 1.6;">
          Explore the Mood Collection, save your favourites to your wishlist, and enjoy
          faster checkout on every order.
        </p>
        ${ctaButton(`${getClientUrl()}/shop`, 'EXPLORE THE COLLECTION')}
    `);

export const emailVerificationEmail = (user, code) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Verify Your Email 🔐</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          Welcome to SwissGarden Perfumes! Enter this verification code to activate
          your account:
        </p>
        <div style="text-align: center; margin: 30px 0; padding: 24px; background: #111; border: 1px solid #D4AF37; border-radius: 8px;">
          <span style="color: #D4AF37; font-size: 36px; letter-spacing: 12px; font-weight: bold;">${escapeHTML(String(code))}</span>
          <p style="color: #999; font-size: 12px; margin-top: 12px;">This code expires in 15 minutes.</p>
        </div>
        <p style="color: #999; font-size: 13px; line-height: 1.6;">
          If you did not create an account with us, you can safely ignore this email —
          no account will be activated without this code.
        </p>
    `);

// ─── Newsletter ───────────────────────────────────────────────────

export const newsletterWelcomeEmail = () =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Your 10% Welcome Gift 🎁</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Thank you for joining the SwissGarden circle. Here is your exclusive welcome
          code — use it at checkout on your first order:
        </p>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #111; border: 1px dashed #D4AF37; border-radius: 8px;">
          <span style="color: #D4AF37; font-size: 26px; letter-spacing: 6px; font-weight: bold;">WELCOME10</span>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">10% off your first order</p>
        </div>
        ${ctaButton(`${getClientUrl()}/shop`, 'SHOP NOW')}
    `);

// ─── Orders ───────────────────────────────────────────────────────

export const paymentReceiptEmail = (order, user) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Payment Received ✅</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          We have received your payment of <strong style="color: #D4AF37;">${formatINR(order.totalPrice)}</strong>
          for order <strong style="color: #D4AF37;">${escapeHTML(order.orderNumber)}</strong>.
          Your order is confirmed and is being prepared for dispatch.
        </p>
        <div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">
          Payment ID: <span style="color: #D4AF37;">${escapeHTML(order.paymentResult?.id || '—')}</span><br>
          Paid on: ${formatDate(order.paidAt)}
        </div>
        ${orderItemsTable(order)}
        ${ctaButton(`${getClientUrl()}/orders`, 'VIEW MY ORDER')}
    `);

/** Internal alert for store owners whenever a confirmed order is placed. */
export const adminNewOrderEmail = (order, user) => {
    const addr = order.shippingAddress || {};
    const customerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Customer';
    return baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">🛒 New Order — ${escapeHTML(order.orderNumber)}</h2>
        <div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">
          <strong style="color: #D4AF37;">Customer:</strong> ${escapeHTML(customerName)}<br>
          <strong style="color: #D4AF37;">Email:</strong> ${escapeHTML(user?.email || '—')}<br>
          <strong style="color: #D4AF37;">Phone:</strong> ${escapeHTML(addr.phone || user?.phone || '—')}<br>
          <strong style="color: #D4AF37;">Payment:</strong> ${escapeHTML(String(order.paymentMethod || '').toUpperCase())}${order.isPaid ? ' (paid)' : ''}<br>
          <strong style="color: #D4AF37;">Total:</strong> ${formatINR(order.totalPrice)}
        </div>
        ${orderItemsTable(order)}
        <div style="margin-top: 10px; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.6;">
          <strong style="color: #D4AF37;">Ship to</strong><br>
          ${escapeHTML(addr.street || '')}${addr.landmark ? `<br>${escapeHTML(addr.landmark)}` : ''}<br>
          ${escapeHTML(addr.city || '')}, ${escapeHTML(addr.state || '')} ${escapeHTML(addr.zipCode || '')}<br>
          ${escapeHTML(addr.country || '')}
        </div>
        ${ctaButton(`${getClientUrl()}/admin`, 'OPEN ADMIN DASHBOARD')}
    `);
};

export const orderShippedEmail = (order, user) => {
    const sr = order.shiprocket || {};
    const awb = order.trackingNumber || sr.awbCode;
    const trackUrl = sr.trackingUrl || (awb ? `https://shiprocket.co/tracking/${encodeURIComponent(awb)}` : null);
    const trackingRows = [
        awb ? `Tracking number: <span style="color: #D4AF37;">${escapeHTML(awb)}</span>` : '',
        sr.courierName ? `Courier: ${escapeHTML(sr.courierName)}` : '',
        sr.estimatedDeliveryDate ? `Estimated delivery: ${escapeHTML(String(sr.estimatedDeliveryDate))}` : '',
    ]
        .filter(Boolean)
        .join('<br>');

    return baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Your Order Is On Its Way 📦</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          Great news — order <strong style="color: #D4AF37;">${escapeHTML(order.orderNumber)}</strong> has shipped.
        </p>
        ${trackingRows ? `<div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">${trackingRows}</div>` : ''}
        ${trackUrl ? ctaButton(trackUrl, 'TRACK / VERIFY ON SHIPROCKET') : ctaButton(`${getClientUrl()}/orders`, 'VIEW MY ORDER')}
    `);
};

export const orderOutForDeliveryEmail = (order, user) => {
    const awb = order.trackingNumber || order.shiprocket?.awbCode;
    const trackUrl =
        order.shiprocket?.trackingUrl ||
        (awb ? `https://shiprocket.co/tracking/${encodeURIComponent(awb)}` : null);
    return baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Out for Delivery 🚚</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          Your order <strong style="color: #D4AF37;">${escapeHTML(order.orderNumber)}</strong> is out for
          delivery and should reach you today. Please keep your phone reachable
          ${order.shiprocket?.courierName ? `— ${escapeHTML(order.shiprocket.courierName)} may call before delivery` : ''}.
        </p>
        ${trackUrl ? ctaButton(trackUrl, 'TRACK / VERIFY ON SHIPROCKET') : ctaButton(`${getClientUrl()}/orders`, 'VIEW MY ORDER')}
    `);
};

export const orderDeliveredEmail = (order, user) => {
    const reviewLinks = (order.orderItems || [])
        .filter((item) => item.product?.slug)
        .map(
            (item) =>
                `<li style="margin: 6px 0;"><a href="${getClientUrl()}/product/${encodeURIComponent(item.product.slug)}" style="color: #D4AF37; text-decoration: none;">${escapeHTML(item.name)}</a></li>`
        )
        .join('');

    return baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Delivered — Thank You 🌿</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          Your order <strong style="color: #D4AF37;">${escapeHTML(order.orderNumber)}</strong> was delivered
          ${order.deliveredAt ? `on ${formatDate(order.deliveredAt)}` : 'today'}. We hope your new
          fragrance becomes your signature.
        </p>
        ${reviewLinks
            ? `<p style="color: #ccc; line-height: 1.6;">Loved it? A short review helps other fragrance lovers choose:</p>
        <ul style="color: #ccc; line-height: 1.6; padding-left: 20px;">${reviewLinks}</ul>`
            : ''}
        <p style="color: #999; line-height: 1.6; font-size: 13px;">
          Any issue with your order? You can request a return within 7 days for unused,
          sealed products from your orders page.
        </p>
        ${ctaButton(`${getClientUrl()}/orders`, 'VIEW MY ORDERS')}
    `);
};

export const orderCancelledEmail = (order, user, { cancelledBy = 'customer' } = {}) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Order Cancelled</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          ${cancelledBy === 'customer'
              ? `As requested, your order <strong style="color: #D4AF37;">${escapeHTML(order.orderNumber)}</strong> has been cancelled.`
              : `Your order <strong style="color: #D4AF37;">${escapeHTML(order.orderNumber)}</strong> has been cancelled by our team. If this is unexpected, please contact support and we will make it right.`}
        </p>
        <p style="color: #ccc; line-height: 1.6;">
          ${order.isPaid
              ? `A refund of <strong style="color: #D4AF37;">${formatINR(order.totalPrice)}</strong> will be processed to your original payment method within 5–7 business days.`
              : 'No amount was charged for this order.'}
        </p>
        ${ctaButton(`${getClientUrl()}/shop`, 'CONTINUE SHOPPING')}
    `);

export const rtoAdminAlertEmail = (order, event = {}) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">⚠️ RTO Initiated — Action Required</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Shiprocket reports a return-to-origin for order
          <strong style="color: #D4AF37;">${escapeHTML(order.orderNumber)}</strong>.
        </p>
        <div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">
          AWB: ${escapeHTML(order.shiprocket?.awbCode || order.trackingNumber || '—')}<br>
          Courier: ${escapeHTML(order.shiprocket?.courierName || '—')}<br>
          Reason: ${escapeHTML(event.rto_reason || event.reason || 'Not provided')}<br>
          Customer phone: ${escapeHTML(order.shippingAddress?.phone || '—')}<br>
          Order total: ${formatINR(order.totalPrice)} ${order.isPaid ? '(PAID — refund may be due)' : '(COD — not charged)'}
        </div>
        <p style="color: #999; font-size: 13px;">Follow up with the customer and courier from the admin dashboard.</p>
    `);

// ─── Returns ──────────────────────────────────────────────────────

const REFUND_METHOD_LABELS = {
    original_payment: 'your original payment method',
    store_credit: 'store credit',
    bank_transfer: 'bank transfer',
};

const returnRef = (returnDoc) => String(returnDoc._id).slice(-8).toUpperCase();

const returnItemsList = (returnDoc) =>
    (returnDoc.returnItems || [])
        .map(
            (item) =>
                `<li style="margin: 6px 0;">${escapeHTML(item.name)} × ${item.quantity} — <span style="color: #999;">${escapeHTML(item.reason)}</span></li>`
        )
        .join('');

export const returnRequestedEmail = (returnDoc, user, order) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Return Request Received</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          We have received your return request <strong style="color: #D4AF37;">#${returnRef(returnDoc)}</strong>
          for order <strong style="color: #D4AF37;">${escapeHTML(order?.orderNumber || '')}</strong>.
          Our team will review it within 1–2 business days.
        </p>
        <ul style="color: #ccc; line-height: 1.6; padding-left: 20px;">${returnItemsList(returnDoc)}</ul>
        <div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">
          Refund amount: <strong style="color: #D4AF37;">${formatINR(returnDoc.refundAmount)}</strong><br>
          Refund method: ${REFUND_METHOD_LABELS[returnDoc.refundMethod] || escapeHTML(returnDoc.refundMethod)}
        </div>
        <p style="color: #999; font-size: 13px; line-height: 1.6;">
          Refunds are processed within 7 days of the returned items reaching us, provided
          they are unused and sealed.
        </p>
        ${ctaButton(`${getClientUrl()}/orders`, 'VIEW MY ORDERS')}
    `);

export const returnAdminAlertEmail = (returnDoc, order) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">📥 New Return Request</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Return <strong style="color: #D4AF37;">#${returnRef(returnDoc)}</strong> filed for order
          <strong style="color: #D4AF37;">${escapeHTML(order?.orderNumber || '')}</strong>.
        </p>
        <ul style="color: #ccc; line-height: 1.6; padding-left: 20px;">${returnItemsList(returnDoc)}</ul>
        <div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">
          Reason: ${escapeHTML(returnDoc.returnReason)}<br>
          Refund: ${formatINR(returnDoc.refundAmount)} via ${escapeHTML(returnDoc.refundMethod)}<br>
          ${returnDoc.description ? `Notes: ${escapeHTML(returnDoc.description)}` : ''}
        </div>
        <p style="color: #999; font-size: 13px;">Review and approve/reject from the admin dashboard.</p>
    `);

export const returnStatusUpdateEmail = (returnDoc, user, order) => {
    const ref = returnRef(returnDoc);
    const orderNo = escapeHTML(order?.orderNumber || '');
    let heading;
    let body;

    switch (returnDoc.status) {
        case 'approved': {
            const addr = returnDoc.returnAddress;
            const addrHtml =
                addr && (addr.street || addr.city)
                    ? `<div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">
                        <strong style="color: #D4AF37;">Ship your return to:</strong><br>
                        ${escapeHTML(addr.street || '')}<br>
                        ${escapeHTML(addr.city || '')}${addr.state ? `, ${escapeHTML(addr.state)}` : ''} ${escapeHTML(addr.zipCode || '')}<br>
                        ${escapeHTML(addr.country || 'India')}
                       </div>`
                    : '';
            heading = 'Return Approved ✅';
            body = `
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          Your return <strong style="color: #D4AF37;">#${ref}</strong> for order
          <strong style="color: #D4AF37;">${orderNo}</strong> has been approved.
          Please pack the items securely in their original packaging.
        </p>
        ${addrHtml}
        <p style="color: #ccc; line-height: 1.6;">
          Your refund of <strong style="color: #D4AF37;">${formatINR(returnDoc.refundAmount)}</strong>
          (${REFUND_METHOD_LABELS[returnDoc.refundMethod] || escapeHTML(returnDoc.refundMethod)}) will be
          processed within 7 days of the items reaching us.
        </p>`;
            break;
        }
        case 'rejected':
            heading = 'Return Request Update';
            body = `
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          After review, we are unable to approve return <strong style="color: #D4AF37;">#${ref}</strong>
          for order <strong style="color: #D4AF37;">${orderNo}</strong>.
        </p>
        ${returnDoc.adminNotes ? `<div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.6;"><strong style="color: #D4AF37;">Reason:</strong> ${escapeHTML(returnDoc.adminNotes)}</div>` : ''}
        <p style="color: #ccc; line-height: 1.6;">
          If you believe this is a mistake, reply to this email or contact support and we
          will take another look.
        </p>`;
            break;
        case 'completed':
        default:
            heading = 'Refund Processed 💳';
            body = `
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          Your refund of <strong style="color: #D4AF37;">${formatINR(returnDoc.refundAmount)}</strong>
          for return <strong style="color: #D4AF37;">#${ref}</strong> (order
          <strong style="color: #D4AF37;">${orderNo}</strong>) has been processed via
          ${REFUND_METHOD_LABELS[returnDoc.refundMethod] || escapeHTML(returnDoc.refundMethod)}.
        </p>
        <p style="color: #999; font-size: 13px; line-height: 1.6;">
          Depending on your bank, it may take 5–7 business days for the amount to reflect.
        </p>`;
            break;
    }

    return baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">${heading}</h2>
        ${body}
        ${ctaButton(`${getClientUrl()}/orders`, 'VIEW MY ORDERS')}
    `);
};

// ─── Contact ──────────────────────────────────────────────────────

export const contactAcknowledgementEmail = (contact) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">We Got Your Message 💬</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(contact.name)},<br><br>
          Thank you for reaching out. Our team typically responds within 24 hours
          (10 AM – 7 PM IST, Mon–Sat).
        </p>
        <div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">
          <strong style="color: #D4AF37;">Subject:</strong> ${escapeHTML(contact.subject)}<br>
          <strong style="color: #D4AF37;">Your message:</strong><br>
          <span style="color: #999;">${escapeHTML(contact.message)}</span>
        </div>
    `);

export const contactAdminAlertEmail = (contact) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">📨 New Contact Message</h2>
        <div style="margin: 24px 0; padding: 16px; background: #111; border-radius: 8px; color: #ccc; line-height: 1.8;">
          <strong style="color: #D4AF37;">From:</strong> ${escapeHTML(contact.name)} &lt;${escapeHTML(contact.email)}&gt;<br>
          <strong style="color: #D4AF37;">Subject:</strong> ${escapeHTML(contact.subject)}<br>
          <strong style="color: #D4AF37;">Message:</strong><br>
          <span style="color: #999;">${escapeHTML(contact.message)}</span>
        </div>
        <p style="color: #999; font-size: 13px;">Reply from the admin dashboard to notify the customer automatically.</p>
    `);

export const contactReplyEmail = (contact) =>
    baseLayout(`
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">We Replied to Your Message</h2>
        <p style="color: #ccc; line-height: 1.6;">Dear ${escapeHTML(contact.name)},</p>
        <div style="margin: 24px 0; padding: 16px; background: #111; border-left: 3px solid #D4AF37; border-radius: 4px; color: #ccc; line-height: 1.8;">
          ${escapeHTML(contact.reply || '')}
        </div>
        <p style="color: #999; font-size: 13px; line-height: 1.6;">
          In reply to your message: “${escapeHTML(contact.subject)}”. Need more help?
          Just reply to this email.
        </p>
    `);
