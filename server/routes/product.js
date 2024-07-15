const router = require('express').Router()
const ctrls = require('../controllers/product')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/', [verifyAccessToken, isAdmin], uploader.array('images', 7), ctrls.createProduct)
router.get('/recommendation/:uid', ctrls.getRecommendedProducts) //TODO: Add verifyAccessToken
router.get('/', ctrls.getAllProduct)
router.put('/', ctrls.updateAll)
router.get('/flashsale', ctrls.getAllProductsInFlashSale)

router.put('/ratings', verifyAccessToken, ctrls.rating)
router.put('/uploadimage/:pid', [verifyAccessToken, isAdmin], uploader.array('images', 7), ctrls.uploadImageProduct)
router.get('/:pid', ctrls.getProduct)

router.put('/:pid', [verifyAccessToken, isAdmin], ctrls.updateProduct)
router.delete('/:pid', [verifyAccessToken, isAdmin], ctrls.deleteProduct)
module.exports = router