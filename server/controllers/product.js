const { request } = require('express')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input!!')
    if (req.body && req.body.productName) req.body.slug = slugify(req.body.productName)
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        newProduct: newProduct ? newProduct : 'Cannot create product'
    })
})

const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot find product'
    })
})

const getAllProduct = asyncHandler(async (req, res) => {
    const product = await Product.find()
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot get product'
    })
})

const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.productName) req.body.slug = slugify(req.body.productName)
    const updatedProduct = await Product.findByIdAndUpdate( pid , req.body, { new: true })
    return res.status(200).json({
        success: updatedProduct ? true : false,
        updatedProduct: updatedProduct ? updatedProduct : 'Updated product is failed'
    })
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.productName) req.body.slug = slugify(req.body.productName)
    const deletedProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deletedProduct ? true : false,
        deletedProduct: deletedProduct ? deletedProduct : 'Delete product is failed'
    })
})


module.exports = {
    createProduct,
    getProduct,
    getAllProduct,
    updateProduct,
    deleteProduct
}