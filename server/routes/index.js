const userRouter = require('./user')
const productRouter = require('./product')
const productCategoryRouter = require('./productCategory')
const brandRouter = require('./brand')
const voucherRouter = require('./voucher')
const orderRouter = require('./order')
const chatRouter = require('./chat')
const notificationRouter = require('./notification')
const flashSaleRouter = require('./flashSale')
const { notFound, errHandler } = require('../middlewares/errHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/productCategory', productCategoryRouter)
    app.use('/api/brand', brandRouter)
    app.use('/api/voucher', voucherRouter)
    app.use('/api/bill', orderRouter)
    app.use('/api/chat', chatRouter)
    app.use('/api/notification', notificationRouter)
    app.use('/api/flash-sale', flashSaleRouter)
    app.use(notFound)
    app.use(errHandler)
}


module.exports = initRoutes