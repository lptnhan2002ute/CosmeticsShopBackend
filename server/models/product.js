const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        //unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'ProductCategory'
    },
    stockQuantity: {
        type: Number,
        default: 0
    },
    soldQuantity: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: Array,
        required: true,
    },
    ratings: [
        {
            star: { type: Number },
            postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
            comment: { type: String },
        }
    ],
    totalRatings: {
        type: Number,
        default: 0,
    }

}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);