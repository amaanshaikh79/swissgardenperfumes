import nodemailer from 'nodemailer';

/**
 * Send email utility
 */
const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Email error:', error.message);
        // Don't throw - email failure shouldn't break the flow
        return null;
    }
};

/**
 * Generate order confirmation email HTML
 */
export const orderConfirmationEmail = (order, user) => {
    const itemsHtml = order.orderItems
        .map(
            (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;">
        <strong style="color: #D4AF37;">${item.name}</strong>
        ${item.size ? `<br><small style="color: #999;">${item.size}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center; color: #ccc;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; color: #D4AF37;">$${item.price.toFixed(2)}</td>
    </tr>
  `
        )
        .join('');

    return `
    <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; font-family: 'Georgia', serif;">
      <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%);">
        <h1 style="color: #D4AF37; font-size: 28px; margin: 0; letter-spacing: 4px;">swissgarden</h1>
        <p style="color: #999; font-size: 12px; letter-spacing: 6px; margin-top: 8px;">PERFUMES</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 20px;">Order Confirmed ✨</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Dear ${user.firstName},<br><br>
          Thank you for your exquisite purchase. Your order <strong style="color: #D4AF37;">${order.orderNumber}</strong> has been confirmed.
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
          <p style="color: #999; margin: 4px 0;">Subtotal: $${order.itemsPrice.toFixed(2)}</p>
          <p style="color: #999; margin: 4px 0;">Shipping: $${order.shippingPrice.toFixed(2)}</p>
          <p style="color: #999; margin: 4px 0;">Tax: $${order.taxPrice.toFixed(2)}</p>
          <p style="color: #D4AF37; font-size: 20px; margin-top: 10px;"><strong>Total: $${order.totalPrice.toFixed(2)}</strong></p>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #111; border-radius: 8px;">
          <h3 style="color: #D4AF37; margin-bottom: 10px;">Shipping Address</h3>
          <p style="color: #ccc; line-height: 1.6;">
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}
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
