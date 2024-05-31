const cron = require('node-cron')
const FlashSale = require('../models/flashSale')
const Product = require('../models/product')

async function updateFlashSaleStatuses() {
    console.log('Checking and updating flash sale statuses...');
    const now = new Date();

    try {
        const flashSales = await FlashSale.find({
            $or: [
                { status: 'Upcoming', startTime: { $lte: now } },
                { status: 'Active', endTime: { $lte: now } }
            ]
        }).sort({ startTime: 1 });

        let activeSaleExists = await FlashSale.findOne({ status: 'Active' });

        for (const sale of flashSales) {
            if (sale.status === 'Upcoming' && sale.startTime <= now) {
                for (let productDetail of sale.products) {
                    const product = await Product.findById(productDetail.product);
                    if (product.stockQuantity < productDetail.quantity) {
                        productDetail.quantity = product.stockQuantity;
                    }
                }
                if (!activeSaleExists) {
                    if (sale.endTime <= now) {
                        sale.status = 'Ended';
                    } else {
                        sale.status = 'Active';
                        activeSaleExists = true;
                    }
                } else {
                    sale.status = 'Ended';
                }
            }
            else if (sale.status === 'Active' && sale.endTime <= now) {
                sale.status = 'Ended';
            }
            await sale.save();
            console.log(`Updated flash sale ${sale._id} to ${sale.status}`);

        }
    } catch (error) {
        console.error('Failed to update flash sale statuses:', error);
    }
}

cron.schedule('*/* * * * *', updateFlashSaleStatuses, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
});

module.exports = updateFlashSaleStatuses