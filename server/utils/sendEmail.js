import nodemailer from 'nodemailer';

// Module-level transporter — initialized once, reused for every email (connection pooling).
// This prevents opening a new TCP + TLS connection on every single send, which under
// load causes connection exhaustion, latency spikes, and SMTP provider rate limiting.
//
// FAIL-FAST + PORT FALLBACK: hosting providers' networks (e.g. Render) can have a
// given SMTP port silently black-holed to GoDaddy (connections hang with no error
// until the platform's 5-minute proxy timeout kills the request). Every transporter
// therefore uses short connection timeouts, and sends automatically retry across
// GoDaddy's alternate submission ports (465 → 587 → 3535). The first port that
// works is promoted for the lifetime of the process.
let _transporter = null;
let _activePort = null;

const smtpConfigured = () =>
    Boolean(process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD);

const candidatePorts = () => {
    const configured = Number(process.env.SMTP_PORT) || 465;
    return [...new Set([configured, 465, 587, 3535])];
};

const buildTransporter = (port) =>
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        pool: true, // Reuse SMTP connections
        // Fail fast — a hung request must never wait minutes on a dead socket.
        connectionTimeout: 8_000,
        greetingTimeout: 8_000,
        socketTimeout: 20_000,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

const getTransporter = () => {
    if (_transporter) return _transporter;
    if (!smtpConfigured()) return null;
    _activePort = candidatePorts()[0];
    _transporter = buildTransporter(_activePort);
    return _transporter;
};

// Network-level failures where trying another port makes sense. Auth failures
// (EAUTH) are deliberately excluded — a wrong password fails on every port.
const isConnectionError = (err) =>
    ['ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH', 'ENETUNREACH', 'EDNS'].includes(err?.code) ||
    /timed?\s*out|connection/i.test(err?.message || '');

const promoteTransporter = (port) => {
    try {
        _transporter?.close();
    } catch {
        /* ignore */
    }
    _activePort = port;
    _transporter = buildTransporter(port);
    return _transporter;
};

/**
 * Boot-time SMTP reachability check. Tries each candidate port with the
 * fail-fast transporter and promotes the first one that verifies. Logs the
 * outcome so platform logs (e.g. Render) show definitively whether the mail
 * provider is reachable from THIS network. Never throws.
 */
export const verifySmtpTransport = async () => {
    if (!smtpConfigured()) {
        console.log('📧 SMTP not configured — emails disabled');
        return { ok: false, reason: 'not_configured' };
    }
    for (const port of candidatePorts()) {
        try {
            const t = buildTransporter(port);
            await t.verify();
            t.close();
            promoteTransporter(port);
            console.log(`📧 SMTP reachable on ${process.env.SMTP_HOST}:${port} — emails enabled`);
            return { ok: true, port };
        } catch (err) {
            console.warn(`📧 SMTP port ${port} failed from this network: ${err.message}`);
        }
    }
    console.error(
        '🚨 SMTP UNREACHABLE on all ports (465/587/3535). The mail provider is likely ' +
        'blocking this host\'s IP range. Emails will fail fast instead of hanging; ' +
        'switch to an HTTPS-based email service (e.g. Brevo/Resend) to restore email.'
    );
    return { ok: false, reason: 'unreachable' };
};

/**
 * Escape HTML special characters to prevent XSS in email templates.
 */
export const escapeHTML = (str) => {
    if (typeof str !== 'string') return String(str ?? '');
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Send email utility. On network-level failures it retries once per alternate
 * SMTP port (465/587/3535) and promotes the first working port. Never throws —
 * email failure must not break the calling flow.
 */
const sendEmail = async (options) => {
    if (!getTransporter()) {
        console.log('📧 Email skipped (SMTP not configured)');
        console.log('📧 To: ', options.email);
        console.log('📧 Subject: ', options.subject);
        console.log('📧 To enable emails, configure SMTP_HOST, SMTP_EMAIL, and SMTP_PASSWORD in .env');
        return null;
    }

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'SwissGarden Perfumes'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // Try the active port first, then the remaining candidates on network errors.
    const ports = [_activePort, ...candidatePorts().filter((p) => p !== _activePort)];
    for (let i = 0; i < ports.length; i++) {
        const transporter = i === 0 ? _transporter : promoteTransporter(ports[i]);
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`📧 Email sent (port ${ports[i]}):`, info.messageId);
            return info;
        } catch (error) {
            console.error(`❌ Email error on port ${ports[i]}:`, error.message);
            if (!isConnectionError(error) || i === ports.length - 1) {
                return null; // auth/content error, or all ports exhausted
            }
        }
    }
    return null;
};

/**
 * Generate order confirmation email HTML
 */
export const orderConfirmationEmail = (order, user) => {
    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const itemsHtml = order.orderItems
        .map(
            (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;">
        <strong style="color: #D4AF37;">${escapeHTML(item.name)}</strong>
        ${item.size ? `<br><small style="color: #999;">${escapeHTML(item.size)}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center; color: #ccc;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; color: #D4AF37;">${formatINR(item.price)}</td>
    </tr>
  `
        )
        .join('');

    const addr = order.shippingAddress;

    return `
    <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; font-family: 'Georgia', serif;">
      <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%);">
        <h1 style="color: #D4AF37; font-size: 28px; margin: 0; letter-spacing: 4px;">swissgarden</h1>
        <p style="color: #999; font-size: 12px; letter-spacing: 6px; margin-top: 8px;">PERFUMES</p>
      </div>

      <div style="padding: 40px 30px;">
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Order Confirmed ✨</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${escapeHTML(user.firstName)},<br><br>
          Thank you for your exquisite purchase. Your order <strong style="color: #D4AF37;">${escapeHTML(order.orderNumber)}</strong> has been confirmed.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #D4AF37;">
              <th style="padding: 12px; text-align: left; color: #D4AF37;">Item</th>
              <th style="padding: 12px; text-align: center; color: #D4AF37;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #D4AF37;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align: right; padding: 20px 0; border-top: 2px solid #D4AF37;">
          <p style="color: #999; margin: 4px 0;">Subtotal: ${formatINR(order.itemsPrice)}</p>
          <p style="color: #999; margin: 4px 0;">Shipping: ${formatINR(order.shippingPrice)}</p>
          <p style="color: #999; margin: 4px 0;">Tax: ${formatINR(order.taxPrice)}</p>
          <p style="color: #D4AF37; font-size: 20px; margin-top: 10px;"><strong>Total: ${formatINR(order.totalPrice)}</strong></p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #111; border-radius: 8px;">
          <h3 style="color: #D4AF37; margin-bottom: 10px;">Shipping Address</h3>
          <p style="color: #ccc; line-height: 1.6;">
            ${escapeHTML(addr.street)}<br>
            ${escapeHTML(addr.city)}, ${escapeHTML(addr.state)} ${escapeHTML(addr.zipCode)}<br>
            ${escapeHTML(addr.country)}
          </p>
        </div>
      </div>

      <div style="text-align: center; padding: 30px; background: #111; border-top: 1px solid #333;">
        <p style="color: #666; font-size: 12px;">© 2025 swissgarden Perfumes. All rights reserved.</p>
        <p style="color: #666; font-size: 11px; margin-top: 8px;">Crafted with passion for the discerning connoisseur.</p>
      </div>
    </div>
  `;
};

export default sendEmail;
