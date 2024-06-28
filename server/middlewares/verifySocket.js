const jwt = require('jsonwebtoken');

const verifySocketMiddleware = (socket, next) => {
    const token = socket.handshake?.auth?.token?.split('Bearer')?.[1]?.trim();
    jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }, (err, decode) => {
        socket.user = decode;
        socket.join(decode?._id);
        next();
    })
}

module.exports = {
    verifySocketMiddleware
}