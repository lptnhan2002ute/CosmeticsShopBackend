const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const { resetAccessToken } = require('../controllers/user');

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err && err.name === 'TokenExpiredError') {
                // AccessToken hết hạn, làm mới lại
                return resetAccessToken(req, res, next);
            } else if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Trạng thái đăng nhập đã hết hạn. Vui lòng đăng nhập lại!!'
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Authentication token missing'
        });
    }
});


const isAdmin = asyncHandler((req, res, next) => {
    const { role } = req.user
    if (role !== 'Admin')
        return res.status(401).json({
            success: false,
            mess: 'Bạn cần là Admin để sử dụng chức năng này'
        })
    next()
})

module.exports = {
    verifyAccessToken,
    isAdmin
}