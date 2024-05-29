const cron = require('node-cron');
const mongoose = require('mongoose');
const Order = require('../models/order'); // Adjust the path as necessary
const Product = require('../models/product');
const Voucher = require('../models/voucher');
const FlashSale = require('../models/flashSale');


async function cancelOutdatedUnpaidOrders() {
    const date24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        const unpaidOrders = await Order.find({
            status: 'Unpaid',
            createdAt: { $lt: date24HoursAgo }
        }).populate('products.product');

        const now = new Date();
        const activeFlashSale = await FlashSale.findOne({
            status: 'Active',
            startTime: { $lte: now },
            endTime: { $gte: now }
        });

        const updateProductQuantities = unpaidOrders.map(async (order) => {
            const updatePromises = order.products.map(async (item) => {
                const product = await Product.findById(item.product);
                if (!product) {
                    throw new Error(`Sản phẩm với id ${item.product} không tồn tại`);
                }

                if (activeFlashSale) {
                    const flashSaleProduct = activeFlashSale.products.find(
                        (fsProduct) => fsProduct.product.toString() === item.product.toString()
                    );

                    if (flashSaleProduct) {
                        await FlashSale.updateOne(
                            { 'products.product': item.product },
                            { $inc: { 'products.$.quantity': item.count, 'products.$.soldQuantity': -item.count } }
                        );
                    } else {
                        await Product.updateOne(
                            { _id: item.product },
                            { $inc: { stockQuantity: item.count, soldQuantity: -item.count } }
                        );
                    }
                } else {
                    await Product.updateOne(
                        { _id: item.product },
                        { $inc: { stockQuantity: item.count, soldQuantity: -item.count } }
                    );
                }
            });

            await Promise.all(updatePromises);

            if (order.voucher) {
                const voucher = await Voucher.findById(order.voucher);
                if (voucher && voucher.usedCount > 0 && voucher.usedBy.includes(order.orderBy)) {
                    voucher.usedCount -= 1;
                    voucher.usedBy = voucher.usedBy.filter((userId) => !userId.equals(order.orderBy));
                    await voucher.save();
                }
            }

            order.status = 'Cancelled';
            return order.save();
        });

        await Promise.all(updateProductQuantities);
        console.log('Cancelled all outdated unpaid orders.');
    } catch (error) {
        console.error('Error cancelling outdated unpaid orders:', error.message);
    }
}


cron.schedule('*/5 * * * *', cancelOutdatedUnpaidOrders, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
});

module.exports = cancelOutdatedUnpaidOrders