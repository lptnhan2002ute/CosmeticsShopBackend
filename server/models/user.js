const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    userID: {
        type: Number,
        // required: true,
        unique: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        required: true,
        default: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date,

    },
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                // Kiểm tra số điện thoại có đúng định dạng 10 số không
                return /^\d{10}$/.test(value);
            },
            message: 'Số điện thoại phải có định dạng 10 số.',
        },
    },
    avatar: {
        type: String,
    },
    wishlist: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
    status: {
        type: Boolean,
        default: true, // Giá trị mặc định là true
    },
    refreshToken: {
        type: String,
    },

    passwordReset: {
        type: String,
    },

    passwordResetToken: {
        type: String,
    },

    passwordResetTokenTimeout: {
        type: String,
    },
}, {
    timestamps: true
});
// {type: Date,default: Date.now,},
userSchema.pre('save', async function (next) {
    //generate userId
    if (!this.isNew) {
        return next()
    }
    if (this.userID === null || typeof this.userID === 'undefined') {
        const User = mongoose.model('User', userSchema);
        const user = await User.findOne({}, 'userID', { sort: { userID: -1 } }).exec()

        this.userID = user ? user.userID + 1 : 1
    }
    // bcrypt password
    if (!this.isModified('password')) {
            return next()
    }
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
    
    next();
   
});
//Export the model
module.exports = mongoose.model('User', userSchema);