const Message = require('../models/message');
const ChatSession = require('../models/chatSession');
const asyncHandler = require('express-async-handler')


const startChatSession = asyncHandler(async (req, res) => {
    const { adminUserID, customerUserID } = req.body;
    if (!adminUserID || !customerUserID) {
        return res.status(400).json({ message: 'Missing adminUserID or customerUserID' });
    }
    try {
        const chatSession = new ChatSession({ adminUserID, customerUserID });
        await chatSession.save();
        res.status(201).json(chatSession);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

const sendMessage = asyncHandler(async (req, res) => {
    const { senderUserID, sessionID, messageText } = req.body;
    if (!senderUserID || !sessionID || !messageText) {
        return res.status(400).json({ message: 'Missing senderUserID, sessionID, or messageText' });
    }
    try {
        const message = new Message({ senderUserID, sessionID, messageText });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const getMessages = asyncHandler(async (req, res) => {
    const { sessionID } = req.params;
    if (!sessionID) {
        return res.status(400).json({ message: 'Missing sessionID' });
    }
    try {
        const messages = await Message.find({ sessionID })
            .populate({
                path: 'senderUserID',
                select: '_id name avatar'
            });
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const closeChatSession = asyncHandler(async (req, res) => {
    const { sessionID } = req.params;
    const chatSession = await ChatSession.findById(sessionID);
    if (chatSession && chatSession.status !== 'Closed') {
        chatSession.status = 'Closed';
        chatSession.endDate = Date.now();
        await chatSession.save();
        res.status(200).json({ message: 'Chat session closed' });
    } else {
        res.status(400).json({ message: 'Chat session already closed or not found' });
    }
});

module.exports = {
    startChatSession,
    sendMessage,
    getMessages,
    closeChatSession
}