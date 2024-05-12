const Voucher = require('../models/voucher')
const asyncHandler = require('express-async-handler')
const moment = require('moment');

const createVoucher = asyncHandler(async (req, res) => {
    const { name, discount, maxDiscountAmount, minPurchaseAmount, maxUsage, startDay, endDay } = req.body;
    if (!name || discount === null || !maxDiscountAmount || !minPurchaseAmount || !maxUsage || !endDay) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    if (discount < 0 || discount > 100) {
        return res.status(400).json({
            success: false,
            message: 'Invalid discount value. Must be between 0 and 100.'
        });
    }

    const parsedStartDay = startDay ? moment(startDay, 'DD/MM/YYYY').toISOString() : Date.now();
    const parsedEndDay = moment(endDay, 'DD/MM/YYYY').toISOString();

    const existingVoucher = await Voucher.findOne({ name: name.toUpperCase() });
    if (existingVoucher) {
        return res.status(400).json({ success: false, message: 'Voucher with this name already exists' });
    }
    try {
        const voucher = await Voucher.create({
            name: name.toUpperCase(),
            discount,
            maxDiscountAmount,
            minPurchaseAmount,
            maxUsage,
            startDay: parsedStartDay,
            endDay: parsedEndDay,
            usedCount: 0
        });

        return res.status(201).json({ success: true, newVoucher: voucher });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error creating voucher: ' + error.message });
    }
})

const findByName = asyncHandler(async (req, res) => {
    const { name } = req.body

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Name is required'
        });
    }
    try {
        const voucher = await Voucher.findOne({ name: name.toUpperCase() }).exec();
        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher does not exist'
            });
        }

        return res.status(200).json({
            success: true,
            result: voucher
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error finding voucher by name: ' + error.message
        });
    }
})

const findById = asyncHandler(async (req, res) => {
    const { vid } = req.params;
    if (!vid) {
        return res.status(400).json({
            success: false,
            message: 'Voucher ID is required'
        });
    }

    try {
        const voucher = await Voucher.findById(vid).exec();
        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher does not exist'
            });
        }

        return res.status(200).json({
            success: true,
            result: voucher
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error finding voucher by ID: ' + error.message
        });
    }
})

const getAllVouchers = asyncHandler(async (req, res) => {
    try {
        const vouchers = await Voucher.find().select('name _id minPurchaseAmount discount maxDiscountAmount usedCount maxUsage startDay endDay logo');

        if (!vouchers || vouchers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No vouchers found'
            });
        }
        return res.status(200).json({
            success: true,
            voucherList: vouchers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mess: 'Error retrieving vouchers: ' + error.message
        });
    }
})

const updateVoucher = asyncHandler(async (req, res) => {
    const { vid } = req.params
    if (Object.keys(req.body).length === 0 && !req.file) {
        return res.status(400).json({ success: false, message: 'Missing input data' });
    }

    let updatedVoucherData = { ...req.body };

    if (req.body.name) {
        const existingVoucher = await Voucher.findOne({ name: req.body.name.toUpperCase() });
        if (existingVoucher && existingVoucher._id.toString() !== vid) {
            return res.status(400).json({ success: false, message: 'Voucher with this name already exists' });
        }
        updatedVoucherData.name = req.body.name.toUpperCase();
    }

    if (req.body.discount != null) {
        if (req.body.discount < 0 || req.body.discount > 100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discount value. Must be between 0 and 100.'
            });
        }
    }

    if (req.file) {
        updatedVoucherData.logo = req.file.path;
    }

    if (req.body.startDay) {
        const parsedStartDay = moment(req.body.startDay, 'DD/MM/YYYY').toISOString();
        updatedVoucherData.startDay = parsedStartDay;
    }

    if (req.body.endDay) {
        const parsedEndDay = moment(req.body.endDay, 'DD/MM/YYYY').toISOString();
        const startDay = new Date(req.body.startDay ? moment(req.body.startDay, 'DD/MM/YYYY').toISOString() : Date.now());

        if (startDay > new Date(parsedEndDay)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid endDay. It must be greater than or equal to startDay.'
            });
        }
        updatedVoucherData.endDay = parsedEndDay;
    }

    try {
        const voucher = await Voucher.findByIdAndUpdate(vid, updatedVoucherData, { new: true });

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher not found'
            });
        }

        return res.status(200).json({ success: true, updatedVoucher: voucher });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating voucher: ' + error.message });
    }
})

const deleteVoucher = asyncHandler(async (req, res) => {
    const { vid } = req.params

    if (!vid) {
        return res.status(400).json({
            success: false,
            mess: 'Missing voucher ID'
        });
    }

    try {
        const voucher = await Voucher.findByIdAndDelete(vid);

        if (!voucher) {
            return res.status(404).json({
                success: false,
                mess: 'Voucher not found'
            });
        }

        return res.status(200).json({
            success: true,
            mess: 'Voucher deleted successfully',
            deletedVoucher: voucher
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mess: 'Error deleting voucher: ' + error.message
        });
    }
})
module.exports = {
    createVoucher,
    getAllVouchers,
    updateVoucher,
    deleteVoucher,
    findByName,
    findById
}