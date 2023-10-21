const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const registerUser = asyncHandler(async(req,res) => {
    const {email, password, name} = req.body
    if(!email || !password || !name) 
        return res.status(400).json({
        success: false, 
        message: 'Thieu du lieu'
    })

    const response = await User.create(req.body)
    return res.status(200).json({
         success: response ? true : false,
         response
    }) 

})

module.exports = {
    registerUser
}