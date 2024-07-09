const { request } = require('express')
const Product = require('../models/product')
const Order = require('../models/order')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const Category = require('../models/productCategory');
const FlashSale = require('../models/flashSale');

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input!!');

    // Tạo sản phẩm từ req.body
    if (req.body && req.body.productName) req.body.slug = slugify(req.body.productName);
    const originalPrice = req.body.price
    const newProduct = await Product.create({ ...req.body, originalPrice })

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

const getAllProduct = asyncHandler(async (req, res) => {
    const { query } = req;
    const { sort, page, limit, fields, categoryId, productName, ...filters } = query;

    if (categoryId) {
        filters.category = categoryId;
    }

    let filterString = JSON.stringify(filters);
    filterString = filterString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
    const formattedFilters = JSON.parse(filterString);

    // Thêm tìm kiếm theo tên sản phẩm
    if (productName && productName.trim()) {
        formattedFilters.productName = { $regex: new RegExp(decodeURIComponent(productName.trim()), 'i') };
    }

    let queryCommand = Product.find(formattedFilters)
        .populate('brand', '_id brandName')
        .populate('category', '_id categoryName');

    if (sort) {
        const sortBy = sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
    }

    if (fields) {
        const selectFields = fields.split(',').join(' ');
        queryCommand = queryCommand.select(selectFields);
    }

    // Phân trang
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit);

    // Thực hiện truy vấn
    const products = await queryCommand.exec();

    if (!products || products.length === 0) {
        return res.status(200).json({
            success: true,
            counts: 0,
            productData: []
        });
    }

    // Kiểm tra flash sale đang diễn ra
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

    const counts = await Product.countDocuments(formattedFilters);

    return res.status(200).json({
        success: true,
        counts,
        productData: modifiedProductsData
    });
});

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
    if (!pid.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Sai định dạng pid');
    }
    if (!star || !pid) throw new Error('Missing input')
    const product = await Product.findById(pid)
    if (!product) throw new Error('Product not found')

    const isPurchased = await Order.exists({
        'products.product': pid,
        orderBy: _id,
        status: { $in: ['Confirmed', 'Shipped'] }
    });

    if (!isPurchased) {
        throw new Error('Bạn phải mua hàng mới được quyền đánh giá')
    }

    const existingRating = product.ratings.find(ele => ele.postedBy && ele.postedBy.toString() === _id)

    if (existingRating) {
        existingRating.star = star
        existingRating.comment = comment
        existingRating.updatedAt = updatedAt
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
        product,
        message: 'Bạn đã đánh giá thành công'
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

const getAllProductsInFlashSale = asyncHandler(async (req, res) => {
    const { query } = req;
    const { page, limit, productName, price, ...filters } = query;
    
    const now = new Date();

    const activeFlashSale = await FlashSale.findOne({
        status: 'Active',
        startTime: { $lte: now },
        endTime: { $gte: now }
    }).populate({
        path: 'products.product',
        populate: {
            path: 'brand category',
            select: '_id brandName categoryName'
        }
    });

    if (!activeFlashSale) {
        return res.status(200).json({
            success: true,
            message: 'Hiện tại không trong thời gian FlashSale',
            count: 0,
            products: []
        });
    }

    let filteredProducts = activeFlashSale.products;
    if (price) {
        const priceString = JSON.stringify(price);
        const priceFilters = JSON.parse(priceString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`));
        filteredProducts = filteredProducts.filter(p =>
            (!priceFilters.$gte || priceFilters.$gte <= p.product.price) &&
            (!priceFilters.$lte || p.product.price <= priceFilters.$lte) &&
            (!priceFilters.$lt || p.product.price < priceFilters.$lt) &&
            (!priceFilters.$gt || priceFilters.$gt < p.product.price)
        );
    }

    if (productName) {
        const regex = new RegExp(productName, 'i');
        filteredProducts = filteredProducts.filter(p => regex.test(p.product.productName));
    }

    if(page) {
        const skip = (page - 1) * limit;
        filteredProducts = filteredProducts.slice(skip, skip + limit);
    }

    //flat map
    filteredProducts = filteredProducts.map(e => e.product);

    // Map through the products in the flash sale to structure the response
    return res.status(200).json({
        success: true,
        counts: filteredProducts.length,
        productData: filteredProducts
    });

});

module.exports = {
    createProduct,
    getProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    rating,
    uploadImageProduct,
    updateAll,
    getRecommendedProducts,
    getAllProductsInFlashSale
}