const mongoose = require('mongoose');
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
            required: true
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

flashSaleSchema.pre('save', function (next) {
    if (this.endTime <= this.startTime) {
        next(new Error('End time must be greater than start time'));
    } else {
        next();
    }
});

module.exports = mongoose.model('FlashSale', flashSaleSchema);