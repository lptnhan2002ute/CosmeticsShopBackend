const { request } = require('express')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const Category = require('../models/productCategory');

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
    const product = await Product.findById(pid).populate('brand', 'brandName -_id').populate('category', 'categoryName -_id')
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot find product'
    })
})

const getAllProduct = asyncHandler(async (req, res) => {
    const queries = { ...req.query }
    // Tach cac truong dac biet ra khoi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(field => delete queries[field])

    // Format operators cho dung chuan mongoose
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedElements => `$${matchedElements}`)
    const formatedQueries = JSON.parse(queryString)

    //Filter
    if (queries?.productName) formatedQueries.productName = { $regex: queries.productName, $options: 'i' }
    let queryCommand = Product.find(formatedQueries).populate('brand', '_id brandName').populate('category', '_id categoryName')
    // if (queries?.categoryId) formatedQueries.categoryId = 
    if (queries?.categoryId) {
        formatedQueries.category = queries.categoryId;
        queryCommand = Product.find({ category: formatedQueries.category }).populate('brand', '_id brandName').populate('category', '_id categoryName')
    }
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
            productData: 'Cannot get product',
        });
    }
    let counts
    counts = await Product.countDocuments(formatedQueries);
    if (queries?.categoryId)
        counts = await Product.countDocuments(
            formatedQueries.category ? { category: formatedQueries.category } : {}
        );
    return res.status(200).json({
        success: true,
        counts,
        productData: response,

    });
    //const product = await Product.find()

})


const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.productName) req.body.slug = slugify(req.body.productName)
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
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

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { star, comment, pid } = req.body
    if (!star || !pid) throw new Error('Missing input')
    const product = await Product.findById(pid)
    if (!product) throw new Error('Product not found')

    const existingRating = product.ratings.find(ele => ele.postedBy && ele.postedBy.toString() === _id)

    if (existingRating) {
        existingRating.star = star
        existingRating.comment = comment
    } else {
        product.ratings.push({ star, comment, postedBy: _id })
    }
    await product.save()
    //Sum ratings
    const count = product.ratings.length
    const sumRatings = product.ratings.reduce((sum, ele) => sum + +ele.star, 0)
    product.totalRatings = Math.round(sumRatings * 10 / count) / 10

    await product.save()

    return res.status(200).json({
        status: true
    })

})

const uploadImageProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (!req.files) throw new Error('Missing inputs')
    const product = await Product.findByIdAndUpdate(pid, { $push: { imageUrl: { $each: req.files.map(ele => ele.path) } } }, { new: true }).populate('brand', 'brandName -_id').populate('category', 'categoryName -_id')
    return res.status(200).json({
        status: product ? true : false,
        updated: product ? product : 'Cannot upload images'
    })
})

module.exports = {
    createProduct,
    getProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    rating,
    uploadImageProduct
}