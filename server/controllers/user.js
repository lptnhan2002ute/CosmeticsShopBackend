const User = require('../models/user')
const Cart = require('../models/cart')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const { response } = require('express')
const sendMail = require('../ultils/sendMails')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const createToken = require('uniqid')


const registerGuest = asyncHandler(async (req, res) => {
    const { email, password, name, phone } = req.body
    if (!email || !password || !name || !phone)
        return res.status(400).json({
            success: false,
            mess: 'Thiếu dữ liệu yêu cầu'
        })
    const user = await User.findOne({ email: email })
    if (user) {
        return res.status(400).json({
            success: false,
            mess: 'Email này đã tồn tại trong hệ thống'
        });
    }
    const token = createToken()
    res.cookie('dataregister', { ...req.body, token }, { httpOnly: true, maxAge: 10 * 60 * 1000 })
    const html = `Yêu cầu click vào link ở dưới để hoàn tất quá trình đăng ký. Thời gian link có hiệu lực là 10 phút kể từ khi bạn nhận được. <form action="${process.env.URL_SERVER}/api/user/finalregister/${token}" method="POST"><button type="submit">Click here</button></form>`;
    const data = {
        email,
        html,
        subject: 'Final Registration'
    }
    try {
        await sendMail(data); // Sử dụng hàm sendMail để gửi email
        // Trả về result từ hàm sendMail
        return res.status(200).json({
            success: true,
            mess: 'Đã gửi email xác nhận. Vui lòng check mail để kích hoạt tài khoản'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
})
const finalRegister = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    const { token } = req.params
    if (!cookie || cookie?.dataregister?.token !== token) {
        res.clearCookie('dataregister')
        return res.redirect(`${process.env.CLIENT_URL}/finalregister/failed`)
    }
    const newUser = await User.create({
        email: cookie?.dataregister?.email,
        password: cookie?.dataregister?.password,
        name: cookie?.dataregister?.name,
        phone: cookie?.dataregister?.phone,
    })
    res.clearCookie('dataregister')
    if (newUser) {
        const cart = new Cart({
            userId: newUser._id,
            products: []
        });
        await cart.save();
        return res.redirect(`${process.env.CLIENT_URL}/finalregister/success`)
    }
    else return res.redirect(`${process.env.CLIENT_URL}/finalregister/failed`)
})


//RefreshToken => Tạo mới AccessToken
//AccessToken => Xác thực, phân quyền người dùng
// Login for User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password)
        return res.status(400).json({
            success: false,
            mess: 'Thiếu dữ liệu yêu cầu'
        })

    const respone = await User.findOne({ email })

    if (respone && await respone.isCorrectPassword(password)) {
        // không hiển thị password và role khi trả về dữ liệu
        const { password, role, refreshToken, ...userData } = respone.toObject()
        // tạo 2 loại token
        const accessToken = generateAccessToken(respone._id, role)
        const newRefreshToken = generateRefreshToken(respone._id)
        //Lưu refresh token vào database
        await User.findByIdAndUpdate(respone._id, { refreshToken: newRefreshToken }, { new: true })
        // Lưu refresh token vào cookie
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 604800000 })
        return res.status(200).json({
            success: true,
            mess: 'Login successful',
            accessToken,
            userData
        })
    }
    return res.status(401).json({
        success: false,
        mess: 'Đăng nhập thất bại do sai email hoặc password!'
    });
})

const getOneUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -__v')
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    })
})
const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -__v -createdAt -updatedAt')
    const cart = await Cart.findOne({ userId: _id }).populate({ path: 'products.product', select: 'productName price imageUrl' })
    const userCart = {
        user: user,
        cart: {
            products: cart.products.map(item => ({
                product: {
                    _id: item.product._id,
                    productName: item.product.productName,
                    price: item.product.price,
                    image: item.product.imageUrl
                },
                quantity: item.quantity,
            })),
        },
    };

    return res.status(200).json({
        success: true,
        userCart: userCart,
    });
})

const getUser = asyncHandler(async (req, res) => {
    const queries = { ...req.query }
    // Tach cac truong dac biet ra khoi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(field => delete queries[field])

    // Format operators cho dung chuan mongoose
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedElements => `$${matchedElements}`)
    const formatedQueries = JSON.parse(queryString)

    //Filter
    if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' }
    let queryCommand = User.find(formatedQueries).select('-refreshToken -password -__v -passwordResetToken -passwordResetTokenTimeout')

    //Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }

    // Fields limit
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    //Pagination
    //limit: số object lấy về trong 1 api
    // skip: 1
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)


    //Execute query

    const response = await queryCommand.exec();

    if (!response || response.length === 0) {
        return res.status(404).json({
            success: false,
            userData: 'Cannot get User',
        });
    }
    let counts
    counts = await User.countDocuments(formatedQueries);
    return res.status(200).json({
        success: true,
        counts,
        userData: response,

    });
})

const deleteUser = asyncHandler(async (req, res) => {
    const { uid } = req.params;

    if (!uid) {
        return res.status(400).json({
            success: false,
            mess: 'Missing inputs',
        });
    }
    const deletedUser = await User.findByIdAndDelete(uid)
    if (deletedUser) {
        await Cart.deleteOne({ userId: uid });
        return res.status(200).json({
            success: true,
            message: `User with email ${deletedUser.email} is deleted`,
        });
    } else {
        return res.status(404).json({
            success: false,
            message: 'No user deleted',
        });
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const updates = req.body;

    if (!_id || !updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu thông tin cần cập nhật.'
        });
    }
    const user = await User.findByIdAndUpdate(_id, req.body, { new: true }).select('-refreshToken -password -role -__v')
    if (user) {
        return res.status(200).json({
            success: true,
            updateUser: user
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Cập nhật thông tin thất bại.'
    });
})
const changePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!_id || !currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            mess: 'Thiếu thông tin cần thiết.'
        });
    }
    const user = await User.findById(_id);
    if (!user) {
        return res.status(404).json({
            success: false,
            mess: 'Người dùng không tồn tại.'
        });
    }
    const isPasswordValid = await user.isCorrectPassword(currentPassword);
    if (!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: 'Mật khẩu hiện tại không chính xác.'
        });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
        success: true,
        message: 'Mật khẩu đã được thay đổi thành công.'
    });
})

const resetAccessToken = asyncHandler(async (req, res) => {
    // lấy token từ cookie
    const cookie = req.cookies
    // Check xem có token hay không
    if (!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookie')
    // Check token còn hạn không

    const result = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: result._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        success: response ? true : false,
        accessToken: response ? generateAccessToken(response._id, response.role) : ' Refresh token is not match '
    })
})


// Tìm cách vô hiệu hóa accessToken khi logout
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookies')
    //Delete the refresh token in database
    await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    // Delete the refresh token in cookie browser
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        mess: 'Logout successful!'
    })
})

// Client gửi mail 
// Server kiểm tra email hợp lệ không => gửi mail kèm link (token reset password)
// Client click vào link => gửi api kèm token
// so sánh 2 token

const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            mess: 'Email not found'
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            mess: 'User not found'
        });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    const html = `Yêu cầu click vào link ở dưới để tạo mật khẩu mới. Thời gian link có hiệu lực là 5 phút kể từ khi bạn nhận được. <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}" method="POST">Click here</a>`;
    const data = {
        email,
        html,
        subject: 'Forgot Password'
    }
    try {
        const result = await sendMail(data); // Sử dụng hàm sendMail để gửi email

        // Trả về result từ hàm sendMail
        return res.status(200).json({
            success: true,
            result,
            mess: 'Đã gửi email xác nhận. Vui lòng check mail'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body
    if (!password || !token) throw new Error('Missing input')
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken, passwordResetTokenTimeout: { $gt: Date.now() } })
    if (!user) throw new Error('Invalid reset Token')
    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordReset = Date.now()
    user.passwordResetToken = undefined
    user.passwordResetTokenTimeout = undefined
    await user.save()
    return res.status(200).json({
        success: user ? true : false,
        mess: user ? 'Updated successfully' : 'Something were wrong'
    })
})


const updateUserByAdmin = asyncHandler(async (req, res) => {
    // req.params
    const { uid } = req.query;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu thông tin cần cập nhật.'
        });
    }
    const user = await User.findByIdAndUpdate(uid, updates, { new: true }).select('-refreshToken -password -role -__v')
    if (user) {
        return res.status(200).json({
            success: true,
            updateUser: user
        })
    }

    return res.status(500).json({
        success: false,
        message: 'Cập nhật thông tin thất bại hoặc người dùng không tồn tại.'
    })
})

const addProductToCart = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { pid, quantity } = req.body
    const product = await Product.findById(pid)
    const defaultQuantity = 1;
    const newQuantity = quantity || defaultQuantity;
    if (!product) {
        return res.status(400).json({
            success: false,
            mess: 'Missing input!'
        });
    }
    const cart = await Cart.findOne({ userId: _id })
    if (!cart) {
        return res.status(404).json({
            success: false,
            mess: 'User cart not found'
        });
    }
    const existingProduct = cart?.products.find(product => product.product.toString() === pid)
    if (existingProduct) {
        existingProduct.quantity += +newQuantity;
    } else {
        cart.products.push({ product: pid, quantity: newQuantity });
    }

    await cart.save();

    return res.status(200).json({
        success: true,
        mess: 'Product added to cart successfully',
        product: cart.products
    })
})

const removeProductFromCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { pid } = req.params;

    const cart = await Cart.findOne({ userId: _id });
    if (!cart) {
        return res.status(404).json({
            success: false,
            mess: 'User cart not found'
        });
    }

    const alreadyProduct = cart?.products.find(product => product.product.toString() === pid)
    if (!alreadyProduct) {
        return res.status(404).json({
            success: false,
            mess: 'Product not found in the cart'
        })
    }
    cart.products.pull({ product: pid });
    await cart.save();
    return res.status(200).json({
        success: true,
        mess: 'Product remove successfully'
    })
});

module.exports = {
    registerGuest,
    loginUser,
    getOneUser,
    resetAccessToken,
    logout,
    forgetPassword,
    resetPassword,
    getUser,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    changePassword,
    addProductToCart,
    finalRegister,
    removeProductFromCart,
    getUserCart

}

