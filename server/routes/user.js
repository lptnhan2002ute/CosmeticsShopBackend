const router = require('express').Router()
const ctrls = require('../controllers/user')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')


router.post('/register', ctrls.registerGuest)

router.post('/login', ctrls.loginUser)

router.get('/customer', verifyAccessToken, ctrls.getOneUser)

router.post('/check', ctrls.resetAccessToken)

router.post('/logout', verifyAccessToken, ctrls.logout)

router.get('/forgetpassword', ctrls.forgetPassword)

router.put('/resetpassword', ctrls.resetPassword)

router.get('/', [verifyAccessToken, isAdmin], ctrls.getUser)

router.delete('/', [verifyAccessToken, isAdmin], ctrls.deleteUser)

router.put('/customer', verifyAccessToken, ctrls.updateUser)
router.put('/', [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin)
module.exports = router

//Post + put : body
// delete + get: query 