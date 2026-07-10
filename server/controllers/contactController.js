import Contact from '../models/Contact.js';
import sendEmail from '../utils/sendEmail.js';
import {
    contactAcknowledgementEmail,
    contactAdminAlertEmail,
    contactReplyEmail,
} from '../utils/emailTemplates.js';

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        const contact = await Contact.create({ name, email, subject, message });

        // Acknowledge the customer + alert the store inbox — fire-and-forget
        sendEmail({
            email: contact.email,
            subject: 'We received your message | SwissGarden Perfumes',
            html: contactAcknowledgementEmail(contact),
        }).catch((err) => console.error('Contact acknowledgement email failed:', err.message));

        sendEmail({
            email: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
            subject: `📨 New Contact Message: ${contact.subject}`,
            html: contactAdminAlertEmail(contact),
        }).catch((err) => console.error('Contact admin alert failed:', err.message));

        res.status(201).json({
            success: true,
            message: 'Your message has been sent. We will get back to you shortly.',
            contact,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all contact messages (Admin)
 * @route   GET /api/contact
 * @access  Admin
 */
export const getContacts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Contact.countDocuments();
        const contacts = await Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.status(200).json({
            success: true,
            count: contacts.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            contacts,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update contact status (Admin)
 * @route   PUT /api/contact/:id
 * @access  Admin
 */
export const updateContact = async (req, res, next) => {
    try {
        // Fetch-compare-save so a status-only edit never re-sends the reply email
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact message not found' });
        }

        const previousReply = contact.reply;
        if (req.body.status) contact.status = req.body.status;
        if (req.body.reply !== undefined) contact.reply = req.body.reply;
        await contact.save();

        // Email the customer only when a NEW/changed reply was added
        const newReply = req.body.reply?.trim();
        if (newReply && newReply !== previousReply) {
            sendEmail({
                email: contact.email,
                subject: `Re: ${contact.subject} | SwissGarden Perfumes`,
                html: contactReplyEmail(contact),
            }).catch((err) => console.error('Contact reply email failed:', err.message));
        }

        res.status(200).json({ success: true, contact });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete contact (Admin)
 * @route   DELETE /api/contact/:id
 * @access  Admin
 */
export const deleteContact = async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact message not found' });
        }

        res.status(200).json({ success: true, message: 'Contact message deleted' });
    } catch (error) {
        next(error);
    }
};
