const mongoose = require('mongoose');
var notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    notificationType: {
        type: String,
        enum: ['Order', 'Promotion'],
        required: true,
    },
    link: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});
module.exports = mongoose.model('Notification', notificationSchema);
