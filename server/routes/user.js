const router = require('express').Router()
const ctrls = require('../controllers/user')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')


router.post('/register', ctrls.registerGuest)

router.post('/finalregister/:token', ctrls.finalRegister)

router.post('/login', ctrls.loginUser)

router.get('/current', verifyAccessToken, ctrls.getOneUser)
router.get('/current-cart', verifyAccessToken, ctrls.getUserCart)

router.post('/check', ctrls.resetAccessToken)

router.post('/logout', verifyAccessToken, ctrls.logout)

router.post('/forgetpassword', ctrls.forgetPassword)

router.put('/resetpassword', ctrls.resetPassword)

router.get('/', [verifyAccessToken, isAdmin], ctrls.getUser)

router.delete('/:uid', [verifyAccessToken, isAdmin], ctrls.deleteUser)

router.put('/customer', verifyAccessToken, ctrls.updateUser)
router.put('/customer/resetpassword', verifyAccessToken, ctrls.changePassword)
router.put('/:uid', [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin)
// router.put('/customer/updateaddress', verifyAccessToken, ctrls.updateUserAddress)
router.put('/cart', verifyAccessToken, ctrls.addProductToCart)
router.delete('/remove-cart/:pid', verifyAccessToken, ctrls.removeProductFromCart)
module.exports = router

//Post + put : body
// delete + get: query 