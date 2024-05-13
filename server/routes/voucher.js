const router = require('express').Router()
const ctrls = require('../controllers/voucher')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')


router.post('/', [verifyAccessToken, isAdmin], ctrls.createVoucher)

router.get('/', ctrls.getAllVouchers)

router.put('/:vid', [verifyAccessToken, isAdmin], uploader.single('logo'), ctrls.updateVoucher)

router.get('/:vid', verifyAccessToken, ctrls.findById)

router.post('/search', verifyAccessToken, ctrls.findByName)

router.delete('/:vid', [verifyAccessToken, isAdmin], ctrls.deleteVoucher)

router.post('/check', verifyAccessToken, ctrls.checkVoucher)

router.post('/send', [verifyAccessToken, isAdmin], ctrls.sendVoucherToUser)
module.exports = router