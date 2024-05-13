const Voucher = require('../models/voucher')
const asyncHandler = require('express-async-handler')
const moment = require('moment');
const sendMail = require('../ultils/sendMails')
const User = require('../models/user')

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const { startDate, endDate, name } = req.query;

    let query = {};
    if (name) {
        query.name = new RegExp(name, 'i'); // Sử dụng RegExp để tìm kiếm không phân biệt hoa thường
    }

    // Thêm điều kiện tìm kiếm theo ngày vào truy vấn
    if (startDate || endDate) {
        if (startDate) {
            query.startDay = { $gte: moment(startDate, 'DD/MM/YYYY').startOf('day').toDate() };
        }
        if (endDate) {
            query.endDay = { $lte: moment(endDate, 'DD/MM/YYYY').endOf('day').toDate() }; // Chỉnh sửa để sử dụng endDay
        }
    }
    try {
        const total = await Voucher.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        const vouchers = await Voucher.find(query)
            .select('name _id logo minPurchaseAmount discount maxDiscountAmount usedCount maxUsage usedBy startDay endDay')
            .skip(offset)
            .limit(limit);

        if (!vouchers || vouchers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No vouchers found'
            });
        }
        return res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
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

    if (req.body.discount !== null) {
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

const checkVoucher = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { vid, total } = req.body

    try {
        const voucher = await Voucher.findById(vid).select('name _id minPurchaseAmount discount maxDiscountAmount usedCount usedBy maxUsage startDay endDay');;

        if (!voucher) {
            return res.status(404).json({
                success: false,
                mess: 'Voucher not found'
            });
        }
        // Kiểm tra thời gian sử dụng voucher
        const currentDate = new Date();
        if (currentDate < voucher.startDay || currentDate > voucher.endDay) {
            return res.status(400).json({
                success: false,
                message: 'Voucher không trong thời gian sử dụng'
            });
        }
        // Kiểm tra giá trị mua tối thiểu
        if (total < voucher.minPurchaseAmount) {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng chưa đạt giá trị tối thiểu để sử dụng voucher'
            });
        }
        // Kiểm tra số lần sử dụng voucher
        if (voucher.usedCount >= voucher.maxUsage) {
            return res.status(400).json({
                success: false,
                message: 'Voucher đã hết lượt sử dụng'
            });
        }
        // Kiểm tra nếu người dùng đã sử dụng voucher này
        if (voucher.usedBy.includes(_id)) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã sử dụng voucher này rồi'
            });
        }
        let discountAmount = (total * voucher.discount) / 100;
        discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
        let finalTotal = total - discountAmount;
        finalTotal = Math.round(finalTotal / 1000) * 1000; // Làm tròn tới hàng ngàn gần nhất

        return res.status(200).json({
            success: true,
            voucher,
            discountAmount,
            finalTotal
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mess: 'Error check voucher: ' + error.message
        });
    }
})

const sendVoucherToUser = asyncHandler(async (req, res) => {
    const { voucherId, email } = req.body;
    let name = email
    if (!voucherId || !email) {
        return res.status(400).json({
            success: false,
            message: 'Voucher ID and email are required'
        });
    }
    const user = await User.findOne({ email });
    if (user)
        name = user.name;

    try {
        const voucher = await Voucher.findById(voucherId);

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher not found'
            });
        }

        const formattedStartDay = moment(voucher.startDay).format('DD/MM/YYYY');
        const formattedEndDay = moment(voucher.endDay).format('DD/MM/YYYY');

        // Tạo nội dung HTML cho email
        const html = `
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: auto;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        h1 {
            color: #4A90E2;
            text-align: center;
        }
        p {
            margin: 10px 0;
            font-size: 16px;
        }
        .highlight {
            color: #FF6F61;
        }
        .info {
            background: #eef;
            padding: 10px;
            border-left: 3px solid #4A90E2;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
        img {
            display: block;
            margin: 10px auto;
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>Thông Tin Voucher</h1>
         <p><strong>Mã giảm giá:</strong> <span class="highlight">${voucher._id}</span></p>
        <p><strong>Tên:</strong> <span class="highlight">${voucher.name}</span></p>
        <p><strong>Mức giảm giá:</strong> <span class="highlight">${voucher.discount}%</span></p>
        <p><strong>Giảm giá tối đa:</strong> <span class="highlight">${voucher.maxDiscountAmount} VND</span></p>
        <p><strong>Cho đơn từ:</strong> <span class="highlight">${voucher.minPurchaseAmount} VND</span></p>
        <div class="info">
            <p><strong>Ngày bắt đầu:</strong> <span class="highlight">${formattedStartDay}</span></p>
            <p><strong>Ngày kết thúc:</strong> <span class="highlight">${formattedEndDay}</span></p>
        </div>
        <div class="footer">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
        </div>
    </div>
</body>
</html>
`;

        // Gửi email
        await sendMail({
            email: email,
            subject: `CosmeticsShop xin trân trọng gửi đến quý khách hàng ${name} voucher khuyến mãi`,
            html: html
        });

        return res.status(200).json({
            success: true,
            message: 'Voucher sent successfully to ' + email
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving voucher: ' + error.message
        });
    }
});

module.exports = {
    createVoucher,
    getAllVouchers,
    updateVoucher,
    deleteVoucher,
    findByName,
    findById,
    checkVoucher,
    sendVoucherToUser
}