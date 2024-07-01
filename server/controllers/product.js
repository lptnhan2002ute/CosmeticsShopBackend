const { request } = require('express')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const Category = require('../models/productCategory');
const FlashSale = require('../models/flashSale');

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input!!');

    // Tạo sản phẩm từ req.body
    if (req.body && req.body.productName) req.body.slug = slugify(req.body.productName);
    const originalPrice = req.body.price
    const newProduct = await Product.create({ ...req.body, originalPrice});

    // Kiểm tra xem sản phẩm đã tạo thành công hay không
    if (!newProduct) throw new Error('Cannot create product');

    // Tiến hành tải ảnh lên cho sản phẩm
    if (!req.files || req.files.length === 0) {
        throw new Error('No images uploaded');
    }

    const { _id: pid } = newProduct; // Lấy id của sản phẩm mới tạo

    // Cập nhật thông tin ảnh cho sản phẩm bằng hàm uploadImageProduct
    const product = await Product.findByIdAndUpdate(
        pid,
        { $push: { imageUrl: { $each: req.files.map(ele => ele.path) } } },
        { new: true }
    ).populate('brand', 'brandName -_id').populate('category', 'categoryName -_id');

    // Kiểm tra và trả về kết quả tải ảnh
    if (product) {
        // Nếu tải ảnh thành công, trả về thông tin sản phẩm đã được cập nhật
        return res.status(200).json({ success: true, updatedProduct: product });
    } else {
        // Nếu có lỗi khi tải ảnh, trả về thông báo lỗi
        throw new Error('Failed to upload images');
    }
});

const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    try {
        const product = await Product.findById(pid).populate('brand', 'brandName -_id').populate('category', 'categoryName -_id').populate({
            path: 'ratings',
            populate: {
                path: 'postedBy',
                select: 'name avatar'
            }
        })
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Cannot find product'
            });
        }
        const now = new Date();
        const flashSale = await FlashSale.findOne({
            'products.product': pid,
            status: 'Active',
            startTime: { $lte: now },
            endTime: { $gte: now }
        });

        let modifiedProductData = product.toObject();
        modifiedProductData.isFlashsale = false
        if (flashSale && modifiedProductData) {
            // Tìm sản phẩm trong danh sách các sản phẩm của flash sale
            const saleProduct = flashSale.products.find(p => p.product.toString() === pid.toString());
            if (saleProduct) {
                modifiedProductData.stockQuantity = saleProduct.quantity; // Số lượng còn lại trong flash sale
                modifiedProductData.soldQuantity = saleProduct.soldQuantity;
                modifiedProductData.isFlashsale = true;
                modifiedProductData.timeRemaining = flashSale.endTime.getTime() - now.getTime();
            }
        }

        return res.status(200).json({
            success: true,
            productData: modifiedProductData
        })
    }
    catch (error) {
        console.error('Failed to fetch product:', error);
        res.status(500).json({
            success: false,
            message: 'Error get info product: ' + error.message
        });
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    const queries = { ...req.query }
    // Tach cac truong dac biet ra khoi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(field => delete queries[field])

    // Format operators cho dung chuan mongoose
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedElements => `$${matchedElements}`)
    const formatedQueries = JSON.parse(queryString)
    if (formatedQueries?.price && formatedQueries.price['$gte'] && formatedQueries.price['$lte']) {
        formatedQueries.price['$gte'] = parseInt(formatedQueries.price['$gte']);
        formatedQueries.price['$lte'] = parseInt(formatedQueries.price['$lte']);
    }

    //Filter
    if (queries?.productName) formatedQueries.productName = { $regex: decodeURIComponent(queries.productName), $options: 'i' }
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
    const page = +req.query.page
    const limit = +req.query.limit

    if (page && limit) {

        const skip = (page - 1) * limit
        queryCommand.skip(skip).limit(limit)
    }

    //Execute query

    const products = await queryCommand.exec();

    if (!products || products.length === 0) {
        return res.status(200).json({
            success: true,
            counts: 0,
            productData: []
        });
    }
    const now = new Date();
    const flashSale = await FlashSale.findOne({
        status: 'Active',
        startTime: { $lte: now },
        endTime: { $gte: now }
    });
    const modifiedProductsData = await Promise.all(products.map(async product => {
        const modifiedProduct = product.toObject();
        modifiedProduct.isFlashsale = false;
        if (flashSale) {
            const saleProduct = flashSale.products.find(p => p.product.toString() === modifiedProduct._id.toString());
            if (saleProduct) {
                modifiedProduct.isFlashsale = true;
                modifiedProduct.timeRemaining = flashSale.endTime.getTime() - now.getTime();
            }
        }
        return modifiedProduct;
    }));
    let counts
    counts = await Product.countDocuments(formatedQueries);
    if (queries?.categoryId)
        counts = await Product.countDocuments(
            formatedQueries.category ? { category: formatedQueries.category } : {}
        );
    return res.status(200).json({
        success: true,
        counts,
        productData: modifiedProductsData,

    });
    //const product = await Product.find()

})

const updateAll = asyncHandler(async (req, res) => {
    try {
        // Lấy tất cả sản phẩm
        let products = await Product.find();

        // Cập nhật giá ban đầu cho mỗi sản phẩm
        const updates = products.map(async (product) => {
            product.originalPrice = product.price;
            return product.save(); // Lưu thay đổi vào cơ sở dữ liệu
        });

        // Đợi cho tất cả các cập nhật hoàn thành
        await Promise.all(updates);

        // Trả về mảng sản phẩm đã cập nhật
        return res.json(200);
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
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
    if (!pid) throw new Error("Missing Inputs")
    const deletedProduct = await Product.findByIdAndDelete(pid);
    return res.status(200).json({
        success: deletedProduct ? true : false,
        deletedProduct: deletedProduct ? deletedProduct : "Cannot delete product"
    })
})

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { star, comment, pid, updatedAt } = req.body
    if (!star || !pid) throw new Error('Missing input')
    const product = await Product.findById(pid)
    if (!product) throw new Error('Product not found')

    const existingRating = product.ratings.find(ele => ele.postedBy && ele.postedBy.toString() === _id)

    if (existingRating) {
        existingRating.star = star
        existingRating.comment = comment
        existingRating.updatedAt = updatedAt
        // existingRating.updatedAt = Date.now()
    } else {
        product.ratings.push({ star, comment, postedBy: _id, updatedAt })
    }
    await product.save()
    //Sum ratings
    const count = product.ratings.length
    const sumRatings = product.ratings.reduce((sum, ele) => sum + +ele.star, 0)
    product.totalRatings = Math.round(sumRatings * 10 / count) / 10

    await product.save()

    return res.status(200).json({
        status: true,
        product
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

const getRecommendedProducts = asyncHandler(async (req, res) => {
    try {
        const { uid } = req.params
        const rs = await fetch(`${process.env.RECOMMENDATION_SERVER}/${uid}`)
        const productIds = await rs.json()


        const products = await Product.find({ _id: { $in: productIds } }).populate('brand', 'brandName -_id').populate('category', 'categoryName')

        return res.status(200).json({
            status: true,
            products
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Error when get recommendation" })
    }

})

module.exports = {
    createProduct,
    getProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    rating,
    uploadImageProduct,
    updateAll,
    getRecommendedProducts
}