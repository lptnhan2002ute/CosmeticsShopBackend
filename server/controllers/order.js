const Order = require('../models/order')
const Cart = require('../models/cart');
const Voucher = require('../models/voucher')
const asyncHandler = require('express-async-handler')

const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const userCart = await Cart.findOne({ userId: _id }).select('userId products').populate('products.product', 'productName price');
    const orderedProducts = req.body.products || [];
    const existingProducts = userCart.products.filter(productItem =>
        orderedProducts.find(orderedItem => orderedItem.product.toString() === productItem.product._id.toString())
    );
    // Kiểm tra xem số lượng sản phẩm trong yêu cầu đặt hàng có vượt quá số lượng trong giỏ hàng hay không
    for (const orderedItem of orderedProducts) {
        const cartProduct = userCart.products.find(productItem => productItem.product._id.toString() === orderedItem.product);
        if (!cartProduct || cartProduct.quantity < orderedItem.quantity) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity for one or more products',
            });
        }
    }
    let total = 0;
    const paidProducts = [];
    existingProducts.forEach((productItem) => {
        total += productItem.product.price * productItem.quantity;
        paidProducts.push(productItem.product._id);
    });
    const voucher = req.body.voucher;
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
    }
    const productsToOrder = existingProducts.map(item => ({
        product: item.product._id,
        count: item.quantity,
    }));
    const data = {
        products: productsToOrder,
        orderBy: _id,
        total: total,
        voucher: voucher || null,
        address: req.body.address || '',
        phone: req.body.phone || null,
        recipient: req.body.recipient || '',
        note: req.body.note || '',
        paymentMethod: req.body.paymentMethod || 'Cash',
    };

    // Tạo đơn hàng
    const result = await Order.create(data);

    // Loại bỏ sản phẩm đã thanh toán khỏi giỏ hàng
    await Cart.updateOne({ userId: _id }, { $pull: { products: { product: { $in: paidProducts } } } });

    return res.status(201).json({
        success: result ? true : false,
        result: result ? result : 'Error for order'
    });
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