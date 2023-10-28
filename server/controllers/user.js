const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const { response } = require('express')
const sendMail = require('../ultils/sendMails')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

// Register for Guest
const registerGuest = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body
    if (!email || !password || !name)
        return res.status(400).json({
            success: false,
            message: 'Thiếu dữ liệu yêu cầu'
        })

    const user = await User.findOne({ email: email })
    if (user)
        throw new Error('Email này đã tồn tại trong hệ thống ')
    else {
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            mess: newUser ? 'Register is successful. You can login' : 'Something were wrong'
        })
    }
})

//RefreshToken => Tạo mới AccessToken
//AccessToken => Xác thực, phân quyền người dùng
// Login for User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password)
        return res.status(400).json({
            success: false,
            message: 'Thiếu dữ liệu yêu cầu'
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
        message: 'Đăng nhập thất bại do sai email hoặc password!'
    });
})

const getOneUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role -__v')
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    })
})

const getUser = asyncHandler(async (req, res) => {
    const response = await User.find().select('-refreshToken -password -role -__v')
    return res.status(200).json({
        success: response ? true : false,
        users: response
    })
})

const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.query;

    if (!_id) {
        return res.status(400).json({
            success: false,
            message: 'Missing inputs',
        });
    }
    const user = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        success: user ? true : false,
        deleteUser: user ? `User with email ${user.email} is deleted` : 'No user deleted'
    })
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
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email not found'
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    const html = `Yêu cầu click vào link ở dưới để tạo mật khẩu mới. Thời gian link có hiệu lực là 5 phút kể từ khi bạn nhận được. <a href="${process.env.URL_SERVER}/api/user/reset-password/${resetToken}">Click here</a>`;

    try {
        const result = await sendMail(email, html); // Sử dụng hàm sendMail để gửi email

        // Trả về result từ hàm sendMail
        return res.status(200).json({
            success: true,
            result,
            message: 'Đã gửi email xác nhận. Vui lòng check mail'
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
    updateUserByAdmin
}

