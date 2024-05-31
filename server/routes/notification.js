const router = require('express').Router()
const ctrls = require('../controllers/notification')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', verifyAccessToken, ctrls.createNotification)
router.get('/:uid', verifyAccessToken, ctrls.getNotiByUserId)

module.exports = router