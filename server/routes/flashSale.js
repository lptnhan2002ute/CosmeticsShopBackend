const router = require('express').Router()
const ctrls = require('../controllers/flashSale')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')


router.post('/create', [verifyAccessToken, isAdmin], ctrls.createFlashSale)
router.get('/:fid', [verifyAccessToken, isAdmin], ctrls.getFlashSaleById)
router.get('/', [verifyAccessToken, isAdmin], ctrls.getAllFlashSales)
router.put('/update/:fid', [verifyAccessToken, isAdmin], ctrls.updateFlashSale)
router.delete('/delete/:fid', [verifyAccessToken, isAdmin], ctrls.deleteFlashSale)

module.exports = router