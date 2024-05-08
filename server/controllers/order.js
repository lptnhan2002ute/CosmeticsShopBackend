const Order = require('../models/order')
const Cart = require('../models/cart');
const Voucher = require('../models/voucher')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const vnpayConfig = require('../config/vnpay.config');
const moment = require('moment');
const queryString = require('qs');
const crypto = require('crypto');

const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const voucher = req.body.voucher;
    let total = req.body.total;
    if (voucher) {
        const selectedVoucher = await Voucher.findById(voucher);
        if (!selectedVoucher) {
            return res.status(400).json({
                success: false,
                mess: 'Voucher không tồn tại',
            });
        }
        total *= 1 - selectedVoucher.discount / 100;
        total = Math.round(total / 1000) * 1000;
    }
    const { products, address, phone, recipient, note, paymentMethod, status } = req.body;
    if (status === 'Unpaid' && !['VnPay', 'PayPal'].includes(paymentMethod)) {
        return res.status(400).json({
            success: false,
            mess: 'Đơn hàng Unpaid phải có paymentMethod là VnPay hoặc PayPal',
        });
    }
    const data = {
        products, orderBy: _id, total, voucher: voucher || null,
        address: address || '', phone: phone || null, recipient: recipient || '',
        note: note || '', paymentMethod: paymentMethod || 'Cash', status: status || 'Pending'
    };

    const paidProducts = [];

    data.products.forEach((productItem) => {
        paidProducts.push(productItem.product)
    });

    // Tạo đơn hàng

    const orderedProducts = data.products
    const soldOutProducts = []

    await Promise.all(
        orderedProducts.map(async (productItem) => {
            const productId = productItem.product;
            const quantityOrdered = productItem.count;
            const product = await Product.findById(productId);
            if (product) {
                if (product.stockQuantity >= quantityOrdered) {
                    // Giảm stockQuantity
                    product.stockQuantity -= quantityOrdered;
                    // Tăng soldQuantity
                    product.soldQuantity += quantityOrdered;
                    // Lưu cập nhật của sản phẩm
                    await product.save();
                }
                else {
                    soldOutProducts.push(product);
                }
            }
        })
    )

    if (soldOutProducts.length > 0) {
        return res.status(400).json({
            success: false,
            status: 'soldout',
            mess: 'Không đủ số lượng sản phẩm để mua',
            product: soldOutProducts
        });
    } else {

        const result = await Order.create(data);
        await Cart.updateOne({ userId: _id }, { $pull: { products: { product: { $in: paidProducts } } } });

        return res.status(201).json({
            success: result ? true : false,
            result: result ? result : 'Tạo đơn hàng bị lỗi'
        })
    }
})

const updateStatus = asyncHandler(async (req, res) => {
    const { oid } = req.params
    const { status } = req.body
    if (!status) throw new Error('Lỗi dữ liệu truyền vào')
    const orderBeforeUpdate = await Order.findById(oid).populate('products.product');
    const currentStatus = orderBeforeUpdate.status;
    if (currentStatus === 'Cancelled') {
        return res.status(400).json({
            success: false,
            mess: 'Không thể mua lại đơn hàng đã hủy',
        });
    }
    if (status === 'Cancelled' && currentStatus !== 'Cancelled') {
        // Cập nhật stockQuantity và soldQuantity của từng sản phẩm trong đơn hàng
        await Promise.all(
            orderBeforeUpdate.products.map(async (productItem) => {
                const product = productItem.product;
                const quantityCancelled = productItem.count;

                // Tăng stockQuantity
                product.stockQuantity += quantityCancelled;
                // Giảm soldQuantity
                product.soldQuantity -= quantityCancelled;

                // Lưu cập nhật của sản phẩm
                await product.save();
            })
        );
    }
    const result = await Order.findByIdAndUpdate(oid, { status }, { new: true })
    return res.json({
        success: result ? true : false,
        result: result ? result : 'Error for update order'
    })
})

const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params; // Assuming the orderId is passed as a URL parameter

    // Find the order to delete
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({
            success: false,
            mess: 'Đơn hàng không tồn tại',
        });
    }

    // Optionally, check if the user has permission to delete this order
    if (req.user._id !== order.orderBy && req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            mess: 'Không có quyền xóa đơn hàng này',
        });
    }

    // Restore the stock quantities if necessary
    const updates = order.products.map(async (productItem) => {
        return Product.findByIdAndUpdate(productItem.product, {
            $inc: {
                stockQuantity: productItem.count,
                soldQuantity: -productItem.count
            }
        });
    });

    try {
        await Promise.all(updates); // Execute all the product updates

        // Delete the order
        await Order.deleteOne({ _id: orderId });

        res.status(200).json({
            success: true,
            mess: 'Đơn hàng đã được xóa thành công'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            mess: 'Lỗi khi xóa đơn hàng'
        });
    }
});


const getUserOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const date24HoursAgo = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

    // Tìm và cập nhật đơn hàng có trạng thái Unpaid và thời gian tạo nhỏ hơn date24HoursAgo
    await Order.updateMany(
        { orderBy: _id, status: 'Unpaid', createdAt: { $lt: date24HoursAgo } },
        { $set: { status: 'Cancelled' } }
    );
    const result = await Order.find({ orderBy: _id }).populate('products.product').sort({ updatedAt: -1 }).exec()
    return res.json({
        success: result ? true : false,
        result: result ? result : 'Lỗi lấy danh sách đơn hàng'
    })
})

const getAllOrders = asyncHandler(async (req, res) => {
    const result = await Order.find().populate('products.product').sort({ updatedAt: -1 }).exec()
    return res.json({
        success: result ? true : false,
        result: result ? result : 'Lỗi lấy danh sách đơn hàng'
    })
})

const getOrderById = asyncHandler(async (req, res) => {
    const { oid } = req.params
    const result = await Order.findById(oid).populate({ path: 'products.product', select: 'productName price imageUrl' })
    return res.json({
        success: result ? true : false,
        result: result ? result : 'Lỗi lấy thông tin đơn hàng'
    })
})

const getOrdersByTime = asyncHandler(async (req, res) => {
    const { startDate, endDate, toDay } = req.query;
    const convertDate = (dateStr, isEndDate = false) => {
        if (!dateStr) return undefined;
        const parts = dateStr.split('/');
        const date = new Date(parts[2], parts[1] - 1, parts[0]);
        if (isEndDate) {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }
        return date;
    };

    const start = convertDate(startDate);
    const end = convertDate(endDate, true);

    try {

        let orders;
        if (!start || !end) {

            if (toDay) {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                orders = await Order.find({
                    status: 'Shipped',
                    updatedAt: { $gte: today, $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
                }).populate({ path: 'products.product', select: 'productName price imageUrl' })
            } else {

                orders = await Order.find({
                    status: 'Shipped'
                }).populate({ path: 'products.product', select: 'productName price imageUrl' })
            }
        } else {

            orders = await Order.find({
                status: 'Shipped',
                updatedAt: { $gte: start, $lte: end }
            }).populate({ path: 'products.product', select: 'productName price imageUrl' });
        }

        return res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mess: 'Lỗi máy chủ khi truy vấn đơn hàng.' });
    }
});

const sortObject = obj => {
    const sorted = {};
    const keys = Object.keys(obj).map(key => encodeURIComponent(key));
    keys.sort();
    keys.forEach(key => {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(obj[key]).replace(/%20/g, '+');
        sorted[encodedKey] = encodedValue;
    });
    return sorted;
};

const createPaymentUrl = asyncHandler(async (req, res) => {
    try {
        const ipAddr =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        const { orderId } = req.body;
        console.log(orderId)
        const now = moment(new Date());

        if (!orderId) {
            return res.status(400).json({ mess: 'Missing orderId' });
        }


        const order = await Order.findById(orderId);
        if (order.total < 5000) {
            return res.status(400).json({ mess: 'Invalid amount' });
        }
        if (!order || (order.status !== 'Unpaid' && order.status !== 'Pending')) {
            return res.status(404).json({ mess: 'Order not found' });
        }

        let vnpParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: process.env.vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: 'Payment for Order ID ' + orderId,
            vnp_OrderType: 'other',
            vnp_Amount: order.total * 100,
            vnp_ReturnUrl: process.env.vnp_ReturnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: now.format('YYYYMMDDHHmmss'),
            vnp_BankCode: 'NCB'
        };
        vnpParams = sortObject(vnpParams);
        let signData = queryString.stringify(vnpParams, { encode: false });
        let hmac = crypto.createHmac('sha512', process.env.vnp_HashSecret);
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnpParams['vnp_SecureHash'] = signed;
        vnpParams['vnp_SecureHashType'] = 'SHA512';
        let vnpUrl = process.env.vnp_Url + '?' + queryString.stringify(vnpParams, { encode: false });
        res.json({ success: true, url: vnpUrl });
    } catch (error) {
        console.error('Error creating payment URL:', error);
        res.status(500).json({ success: false, mess: error.message });
    }
});

const handleVnpayIpn = asyncHandler(async (req, res) => {
    try {
        let vnpParams = req.query;
        console.log(vnpParams['vnp_TxnRef'])
        const secureHash = vnpParams['vnp_SecureHash'];
        const orderId = vnpParams['vnp_TxnRef'];
        const amount = vnpParams['vnp_Amount'];
        const rspCode = vnpParams['vnp_ResponseCode'];

        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];

        vnpParams = sortObject(vnpParams);
        const signData = queryString.stringify(vnpParams, { encode: false });
        const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        let paymentStatus = '0'; // Initial state

        // Example condition checks (You should replace these with actual checks against your database)
        let checkOrderId = true; // Check if orderId exists in your database
        const order = await Order.findById(orderId);
        if (!order) {
            checkOrderId = false
        }

        let checkAmount = true; // Check if the amount matches the database
        if (order.total !== amount / 100) {
            checkAmount = false
        }

        if (secureHash === signed) { // Verify checksum
            if (checkOrderId) {
                if (checkAmount) {
                    if (paymentStatus === '0') { // Check transaction status before updating
                        if (rspCode === '00') {
                            console.log(orderId)
                            // Transaction successful
                            const result = await Order.findByIdAndUpdate(orderId, { status: 'Confirmed', paymentMethod: 'VnPay' }, { new: true })
                            res.status(200).json({ RspCode: '00', Message: 'Success', result: result ? result : 'Error for update order' });
                        } else {
                            // Transaction failed
                            const result = await Order.findByIdAndUpdate(orderId, { status: 'Unpaid', paymentMethod: 'VnPay' }, { new: true })
                            res.status(200).json({ RspCode: rspCode, Message: 'Transaction Failed' });
                        }
                    } else {
                        res.status(200).json({ RspCode: '02', Message: 'This order has been previously updated' });
                    }
                } else {
                    res.status(200).json({ RspCode: '04', Message: 'Amount mismatch' });
                }
            } else {
                res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }
    } catch (error) {
        console.error('Error handling IPN:', error);
        res.status(500).json({ success: false, message: error.mess });
    }
});


module.exports = {
    createOrder,
    updateStatus,
    getOrderById,
    deleteOrder,
    getUserOrder,
    getAllOrders,
    getOrdersByTime,
    createPaymentUrl,
    handleVnpayIpn
}