const Message = require('../models/message');
const ChatSession = require('../models/chatSession');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const ObjectId = require('mongoose').Types.ObjectId; 

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
    const { _id: senderUserID } = req.user
    const { sessionID, messageText } = req.body;
    if (!senderUserID || !sessionID || (!messageText && !req.files)) {
        return res.status(400).json({ message: 'Missing senderUserID, sessionID, or content message' });
    }
    try {
        const session = await ChatSession.findById(sessionID);
        if (!session) {
            return res.status(404).json({
                success: false,
                mess: 'Chat session not found'
            });
        }
        if (session.status !== 'Active') {
            return res.status(400).json({
                success: false,
                mess: 'Chat session is not active'
            });
        }
        const messageData = {
            senderUserID,
            sessionID,
            messageText
        };
        if (req.files && req.files.length > 0) {
            messageData.imageUrls = req.files.map(file => file.path);
        }
        const message = new Message(messageData);
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
    try {
        const { sessionID } = req.params;
        const chatSession = await ChatSession.findById(sessionID);
        if (!chatSession) {
            return res.status(404).json({ message: 'Chat session not found' });
        }
        if (chatSession.status === 'Closed') {
            return res.status(400).json({ message: 'Chat session already closed' });
        }
        chatSession.status = 'Closed';
        chatSession.endDate = Date.now();
        await chatSession.save();
        res.status(200).json({ message: 'Chat session closed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const findSessionsByEmail = asyncHandler(async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                mess: 'User not found'
            });
        }

        const sessions = await ChatSession.find({ customerUserID: user._id })
            .lean()
            .exec();

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                mess: 'No chat sessions found for this user'
            });
        }

        // Lấy tin nhắn cuối cùng cho mỗi phiên
        const sessionDetails = await Promise.all(
            sessions.map(async (session) => {
                const lastMessage = await Message.findOne({ sessionID: session._id })
                    .sort({ createdAt: -1 })
                    .populate('senderUserID', 'name email')
                    .exec();

                let lastMessageInfo = 'No messages in this session';
                if (lastMessage) {
                    if (lastMessage.messageText) {
                        lastMessageInfo = lastMessage.messageText;
                    } else if (lastMessage.imageUrls && lastMessage.imageUrls.length > 0) {
                        lastMessageInfo = `${lastMessage.senderUserID.name} đã gửi ${lastMessage.imageUrls.length} ảnh`;
                    }
                }

                return {
                    ...session,
                    lastMessageInfo,
                    lastMessageTime: lastMessage ? lastMessage.createdAt : null,
                    lastMessageSender: lastMessage ? lastMessage.senderUserID.name : null
                };
            })
        );
        return res.status(200).json({
            success: true,
            sessionDetails: sessionDetails
        });
    } catch (error) {
        console.error('Error finding sessions:', error);
        return res.status(500).json({
            success: false,
            mess: error.message
        });

    }
});

const getAllChatSessions = asyncHandler(async (req, res) => {
    try {
        const id = req.params;
        const sessions = await ChatSession.find({ adminUserID: new ObjectId(id) }).populate('customerUserID').sort([['startDate', '-1']]);
        res.status(200).json(sessions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = {
    startChatSession,
    sendMessage,
    getMessages,
    closeChatSession,
    findSessionsByEmail,
    getAllChatSessions
}