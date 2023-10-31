const Order = require('../models/order');
const asyncHandler = require('express-async-handler')

const createOrder = asyncHandler(async (req, res) => {
    const {uid} = req.user
    const userCart = await User.findById(req.body)
    return res.status(201).json({
        success: order ? true : false,
        createdBrand: order ? order : 'Can not be created brand'
    })
})