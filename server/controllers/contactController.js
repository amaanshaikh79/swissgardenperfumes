import Contact from '../models/Contact.js';

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        const contact = await Contact.create({ name, email, subject, message });

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
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, reply: req.body.reply },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact message not found' });
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
