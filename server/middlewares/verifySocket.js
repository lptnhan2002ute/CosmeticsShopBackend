const jwt = require('jsonwebtoken')

const verifySocketMiddleware = (socket, next) => {
    const token = socket.handshake.auth.token.split('Bearer')[1].trim();

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if (err) return res.status(401).json({
            success: false,
            mess: 'Trạng thái đăng nhập đã hết hạn. Vui lòng đăng nhập!!'
        })
        socket.user = decode
        next()
    })
}

module.exports = {
    verifySocketMiddleware
}