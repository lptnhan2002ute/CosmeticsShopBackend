const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var voucherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true,
    },
    logo: {
        default: 'https://res.cloudinary.com/dronifdsy/image/upload/v1703691000/CosmeticsShop/srde4anqx7ogxodvrpef.jpg',
        type: String,
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    maxDiscountAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    minPurchaseAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    maxUsage: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    startDay: {
        type: Date,
        required: true,
    },
    endDay: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return this.startDay <= value;
            },
            message: 'Ngày kết thúc phải sau ngày bắt đầu.'
        }
    }
}, {
    timestamps: true
});


//Export the model
module.exports = mongoose.model('Voucher', voucherSchema);
