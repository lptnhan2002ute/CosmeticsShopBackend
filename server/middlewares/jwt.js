const jwt = require('jsonwebtoken')

const generateAccessToken = (uid, role) => {
    return jwt.sign({ _id: uid, role }, process.env.JWT_SECRET, { expiresIn: '60s' })
}

const generateRefreshToken = (uid) => {
    return jwt.sign({ _id: uid }, process.env.JWT_SECRET, { expiresIn: '1d' })
}
module.exports =
{
    generateAccessToken,
    generateRefreshToken
}
