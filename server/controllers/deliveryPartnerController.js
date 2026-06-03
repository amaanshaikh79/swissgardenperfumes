import DeliveryPartner from '../models/DeliveryPartner.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all delivery partners
// @route   GET /api/delivery-partners
// @access  Private/Admin
export const getAllDeliveryPartners = asyncHandler(async (req, res) => {
    const deliveryPartners = await DeliveryPartner.find({}).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: deliveryPartners.length,
        deliveryPartners,
    });
});

// @desc    Get single delivery partner
// @route   GET /api/delivery-partners/:id
// @access  Private/Admin
export const getDeliveryPartner = asyncHandler(async (req, res) => {
    const deliveryPartner = await DeliveryPartner.findById(req.params.id);
    
    if (!deliveryPartner) {
        res.status(404);
        throw new Error('Delivery partner not found');
    }
    
    res.status(200).json({
        success: true,
        deliveryPartner,
    });
});

// @desc    Create delivery partner
// @route   POST /api/delivery-partners
// @access  Private/Admin
export const createDeliveryPartner = asyncHandler(async (req, res) => {
    const {
        name,
        company,
        email,
        phone,
        address,
        serviceAreas,
        deliveryCharges,
        logo,
        trackingUrl,
        isActive,
        notes,
    } = req.body;

    const deliveryPartner = await DeliveryPartner.create({
        name,
        company,
        email,
        phone,
        address,
        serviceAreas,
        deliveryCharges,
        logo,
        trackingUrl,
        isActive: isActive !== undefined ? isActive : true,
        notes,
    });

    res.status(201).json({
        success: true,
        deliveryPartner,
    });
});

// @desc    Update delivery partner
// @route   PUT /api/delivery-partners/:id
// @access  Private/Admin
export const updateDeliveryPartner = asyncHandler(async (req, res) => {
    const deliveryPartner = await DeliveryPartner.findById(req.params.id);
    
    if (!deliveryPartner) {
        res.status(404);
        throw new Error('Delivery partner not found');
    }

    const {
        name,
        company,
        email,
        phone,
        address,
        serviceAreas,
        deliveryCharges,
        logo,
        trackingUrl,
        isActive,
        rating,
        totalDeliveries,
        notes,
    } = req.body;

    deliveryPartner.name = name || deliveryPartner.name;
    deliveryPartner.company = company || deliveryPartner.company;
    deliveryPartner.email = email || deliveryPartner.email;
    deliveryPartner.phone = phone || deliveryPartner.phone;
    deliveryPartner.address = address || deliveryPartner.address;
    deliveryPartner.serviceAreas = serviceAreas || deliveryPartner.serviceAreas;
    deliveryPartner.deliveryCharges = deliveryCharges || deliveryPartner.deliveryCharges;
    deliveryPartner.logo = logo !== undefined ? logo : deliveryPartner.logo;
    deliveryPartner.trackingUrl = trackingUrl !== undefined ? trackingUrl : deliveryPartner.trackingUrl;
    deliveryPartner.isActive = isActive !== undefined ? isActive : deliveryPartner.isActive;
    deliveryPartner.rating = rating !== undefined ? rating : deliveryPartner.rating;
    deliveryPartner.totalDeliveries = totalDeliveries !== undefined ? totalDeliveries : deliveryPartner.totalDeliveries;
    deliveryPartner.notes = notes !== undefined ? notes : deliveryPartner.notes;

    await deliveryPartner.save();

    res.status(200).json({
        success: true,
        deliveryPartner,
    });
});

// @desc    Delete delivery partner
// @route   DELETE /api/delivery-partners/:id
// @access  Private/Admin
export const deleteDeliveryPartner = asyncHandler(async (req, res) => {
    const deliveryPartner = await DeliveryPartner.findById(req.params.id);
    
    if (!deliveryPartner) {
        res.status(404);
        throw new Error('Delivery partner not found');
    }

    await DeliveryPartner.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Delivery partner deleted successfully',
    });
});

// @desc    Toggle delivery partner active status
// @route   PATCH /api/delivery-partners/:id/toggle
// @access  Private/Admin
export const toggleDeliveryPartnerStatus = asyncHandler(async (req, res) => {
    const deliveryPartner = await DeliveryPartner.findById(req.params.id);
    
    if (!deliveryPartner) {
        res.status(404);
        throw new Error('Delivery partner not found');
    }

    deliveryPartner.isActive = !deliveryPartner.isActive;
    await deliveryPartner.save();

    res.status(200).json({
        success: true,
        deliveryPartner,
    });
});
