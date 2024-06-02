const FlashSale = require('../models/flashSale')
const Product = require('../models/product')
const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')



const createFlashSale = asyncHandler(async (req, res) => {
    const { saleName, startTime, endTime, products } = req.body;

    // Kiểm tra các thông tin bắt buộc
    if (!saleName || !startTime || !endTime || !products || products.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // Tạo flash sale mới
    try {
        const flashSale = new FlashSale({
            saleName,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            products: products.map(product => ({
                product: new mongoose.Types.ObjectId(product.product),
                discountRate: product.discountRate,
                quantity: product.quantity,
                soldQuantity: 0
            })),
            status: 'Upcoming'
        });

        await flashSale.save();

        res.status(201).json({
            success: true,
            message: 'Flash sale created successfully',
            flashSale: flashSale
        });
    } catch (error) {
        // Lỗi từ middleware hoặc quá trình lưu sẽ được bắt ở đây
        res.status(500).json({
            success: false,
            message: 'Error creating flash sale: ' + error.message
        });
    }
});

const updateFlashSale = asyncHandler(async (req, res) => {
    const { fid } = req.params; // ID của flash sale cần cập nhật
    const { saleName, startTime, endTime, products, status } = req.body;

    try {
        const flashSale = await FlashSale.findById(fid);
        if (!flashSale) {
            return res.status(404).json({
                success: false,
                message: 'Flash sale not found'
            });
        }

        // Cập nhật dữ liệu
        if (saleName) flashSale.saleName = saleName;
        if (startTime) flashSale.startTime = new Date(startTime);
        if (endTime) flashSale.endTime = new Date(endTime);
        if (products) {
            flashSale.products = products.map(product => ({
                product: new mongoose.Types.ObjectId(product.product),
                discountRate: product.discountRate,
                quantity: product.quantity,
                soldQuantity: product.soldQuantity // Điều chỉnh số lượng đã bán nếu cần
            }));
        }
        if (status) {
            if (flashSale.status === 'Upcoming' && status === 'Active') {
                const productUpdates = flashSale.products.map(async productDetail => {
                    const product = await Product.findById(productDetail.product);
                    if (product.stockQuantity < productDetail.quantity) {
                        productDetail.quantity = product.stockQuantity;
                    }
                    return productDetail;
                });
                flashSale.products = await Promise.all(productUpdates);
            }
            flashSale.status = status
        };

        // Lưu thay đổi
        const updatedFlashSale = await flashSale.save(); // Sử dụng save() để kích hoạt middleware

        res.status(200).json({
            success: true,
            message: 'Flash sale updated successfully',
            data: updatedFlashSale
        });
    } catch (error) {
        console.error('Error updating flash sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating flash sale: ' + error.message
        });
    }
});

const deleteFlashSale = asyncHandler(async (req, res) => {
    const { fid } = req.params;

    try {
        const flashSale = await FlashSale.findById(fid);
        if (!flashSale) {
            return res.status(404).json({
                success: false,
                message: 'Flash sale not found'
            });
        }

        // Kiểm tra trạng thái của flash sale, chỉ cho phép xóa khi flash sale chưa kích hoạt
        if (flashSale.status !== 'Upcoming') {
            return res.status(400).json({
                success: false,
                message: 'Only upcoming flash sales can be deleted'
            });
        }

        // Xóa flash sale, middleware sẽ xử lý việc hoàn trả giá nếu cần
        await FlashSale.deleteOne({ _id: fid });

        res.status(200).json({
            success: true,
            message: 'Flash sale deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting flash sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting flash sale: ' + error.message
        });
    }
});

const getAllFlashSales = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const { status, startDate, endDate } = req.query;

    // Xây dựng bộ lọc dựa trên các tham số đầu vào
    let filterOptions = {};
    if (status) {
        filterOptions.status = status;
    }
    if (startDate) {
        filterOptions.startTime = { $gte: new Date(startDate) };
    }
    if (endDate) {
        filterOptions.endTime = { $lte: new Date(endDate) };
    }
    try {
        const total = await FlashSale.countDocuments(filterOptions);
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const flashSales = await FlashSale.find(filterOptions)
            .populate({
                path: 'products.product',
                model: 'Product',
                select: 'name price imageUrl'
            })
            .skip(offset)
            .limit(limit)
            .sort({ startTime: -1 })
            .lean()
            .exec();

        res.status(200).json({
            success: true,
            count: flashSales.length,
            totalPages,
            data: flashSales,
            page,
            limit
        });
    }
    catch (error) {
        console.error('Error fetching flash sales:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching flash sales: ' + error.message
        });
    }
});

const getFlashSaleById = async (req, res) => {
    const { fid } = req.params; // Lấy ID của flash sale từ URL

    if (!mongoose.Types.ObjectId.isValid(fid)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid flash sale ID'
        });
    }

    try {
        const flashSale = await FlashSale.findById(fid)
            .populate({
                path: 'products.product',
                model: 'Product',
                select: 'productName price imageUrl originalPrice'
            })
            .exec();

        if (!flashSale) {
            return res.status(404).json({
                success: false,
                message: 'Flash sale not found'
            });
        }

        // Trả về thông tin chi tiết của flash sale cùng với thông tin sản phẩm
        return res.status(200).json({
            success: true,
            flashSale: {
                id: flashSale._id,
                saleName: flashSale.saleName,
                startTime: flashSale.startTime,
                endTime: flashSale.endTime,
                status: flashSale.status,
                products: flashSale.products.map(item => ({
                    name: item.product.productName,
                    price: item.product.price,
                    originalPrice: item.product.originalPrice,
                    imageUrl: item.product.imageUrl,
                    discountRate: item.discountRate,
                    quantity: item.quantity,
                    soldQuantity: item.soldQuantity
                }))
            }
        });
    } catch (error) {
        console.error('Error retrieving flash sale:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving flash sale details: ' + error.message
        });
    }
};




module.exports = {
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    getAllFlashSales,
    getFlashSaleById
}