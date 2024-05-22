const router = require('express').Router()
const ctrls = require('../controllers/chat')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')


router.post('/start', verifyAccessToken, ctrls.startChatSession)
router.post('/send', verifyAccessToken, uploader.array('images', 8), ctrls.sendMessage)
router.get('/messages/:sessionID', verifyAccessToken, ctrls.getMessages)
router.put('/close/:sessionID', verifyAccessToken, ctrls.closeChatSession)
router.get('/sessions/:email', [verifyAccessToken, isAdmin], ctrls.findSessionsByEmail)
router.get('/:id', verifyAccessToken, isAdmin, ctrls.getAllChatSessions)


module.exports = router