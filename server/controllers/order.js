const Order = require('../models/order')
const Cart = require('../models/cart');
const Voucher = require('../models/voucher')
const asyncHandler = require('express-async-handler')

const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const userCart = await Cart.findOne({ userId: _id }).select('userId products').populate('products.product', 'productName price');
    const products = userCart.products.map((productItem) => ({
        product: productItem.product._id,
        count: productItem.quantity,
    }));
    let total = 0;
    const paidProducts = [];
    userCart.products.forEach((productItem) => {
        total += productItem.product.price * productItem.quantity
        paidProducts.push(productItem.product._id)
    });
    const data = { products, orderBy: _id }
    // Áp dụng voucher (nếu có)
    const { voucher } = req.body;

    if (voucher) {
        const selectedVoucher = await Voucher.findById(voucher);
        if (!selectedVoucher) {
            return res.status(400).json({
                success: false,
                mess: 'Selected voucher does not exist',
            });
        }
        total *= 1 - selectedVoucher.discount / 100;
        total = Math.round(total / 1000) * 1000;
        data.voucher = voucher;
    }
    data.total = total
    // Tạo đơn hàng

    const result = await Order.create(data);
    // Loại bỏ sản phẩm đã thanh toán khỏi giỏ hàng
    await Cart.updateOne({ userId: _id }, { $pull: { products: { product: { $in: paidProducts } } } })
    return res.status(201).json({
        success: result ? true : false,
        result: result ? result : 'Error for order'
    })
})

const updateStatus = asyncHandler(async (req, res) => {
    const { oid } = req.params
    const { status } = req.body
    if (!status) throw new Error('Missing inputs')
    const result = await Order.findByIdAndUpdate(oid, { status }, { new: true })
    return res.json({
        success: result ? true : false,
        result: result ? result : 'Error for order'
    })
})

const getUserOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const result = await Order.find({ orderBy: _id })
    return res.json({
        success: result ? true : false,
        result: result ? result : 'Error for order'
    })
})

const getAllOrders = asyncHandler(async (req, res) => {
    const result = await Order.find()
    return res.json({
        success: result ? true : false,
        result: result ? result : 'Error for order'
    })
})

module.exports = {
    createOrder,
    updateStatus,
    getUserOrder,
    getAllOrders
}