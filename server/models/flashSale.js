const mongoose = require('mongoose');
const Product = require('./product')
var flashSaleSchema = new mongoose.Schema({
    saleName: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        index: true,
    },
    endTime: {
        type: Date,
        required: true,
        index: true,
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        discountRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        quantity: {
            type: Number,
            required: true
        },
        soldQuantity: {
            type: Number,
            default: 0
        }
    }],
    status: {
        type: String,
        enum: ['Active', 'Ended', 'Upcoming'],
        default: 'Upcoming',
    }
}, {
    timestamps: true
});

flashSaleSchema.pre('save', async function (next) {
    const FlashSale = mongoose.model('FlashSale');
    if (this.endTime <= this.startTime) {
        return next(new Error('End time must be greater than start time'));
    }

    const query = {
        _id: { $ne: this._id },
        status: 'Active',
        $or: [
            { startTime: { $lte: this.endTime, $gte: this.startTime } },
            { endTime: { $gte: this.startTime, $lte: this.endTime } }
        ]
    };

    const overlappingSales = await FlashSale.find(query);
    if (overlappingSales.length > 0) {
        return next(new Error('Cannot have multiple active flash sales overlapping in the same period.'));
    }

    if (this.isModified('status')) {
        try {
            if (this.status === 'Active') {
                await updateProductPrices(this, 'apply');
            } else if (this.status === 'Ended' && this._previousStatus !== 'Upcoming') {
                await updateProductPrices(this, 'revert');
            }
        } catch (error) {
            return next(error);
        }
    }

    next();
});

async function updateProductPrices(flashSale, action) {
    const bulkOps = flashSale.products.map(saleProduct => {
        if (action === 'apply') {
            return {
                updateOne: {
                    filter: { _id: saleProduct.product },
                    update: [{
                        $set: {
                            price: {
                                $round: [{ $multiply: ["$originalPrice", (1 - saleProduct.discountRate / 100)] }, -2]
                            },
                            stockQuantity: { $subtract: ["$stockQuantity", saleProduct.quantity] } // Giảm số lượng kho
                        }
                    }]
                }
            };
        } else if (action === 'revert') {
            return {
                updateOne: {
                    filter: { _id: saleProduct.product },
                    update: [{
                        $set: {
                            price: "$originalPrice", // Hoàn trả giá gốc
                            stockQuantity: { $add: ["$stockQuantity", saleProduct.quantity] },  // Hoàn trả số lượng
                            soldQuantity: { $add: ["$soldQuantity", saleProduct.soldQuantity] } // Điều chỉnh số lượng đã bán
                        }
                    }]
                }
            };
        };
    }
    );

    try {
        await Product.bulkWrite(bulkOps, { ordered: false });
    } catch (error) {
        throw new Error('Error updating product prices: ' + error.message);
    }
}


module.exports = mongoose.model('FlashSale', flashSaleSchema);
module.exports.updateProductPrices = updateProductPrices;