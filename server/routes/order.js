const router = require('express').Router()
const ctrls = require('../controllers/order')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', verifyAccessToken, ctrls.createOrder)

router.put('/status/:oid', verifyAccessToken, ctrls.updateStatus)
router.get('/order/:oid', verifyAccessToken, ctrls.getOrderById)
router.delete('/:oid', verifyAccessToken, ctrls.deleteOrder)

router.get('/', verifyAccessToken, ctrls.getUserOrder)
router.get('/admin', [verifyAccessToken, isAdmin], ctrls.getAllOrders)
router.get('/list', [verifyAccessToken, isAdmin], ctrls.getOrdersByTime)

router.post('/create_vnpay_payment', verifyAccessToken, ctrls.createPaymentUrl);
router.get('/vnpay_ipn', verifyAccessToken, ctrls.handleVnpayIpn);
module.exports = router