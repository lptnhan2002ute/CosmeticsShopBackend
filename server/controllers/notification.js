const asyncHandler = require('express-async-handler')
const Notification = require('../models/notification')

const createNotification = asyncHandler(async (req, res) => {
    const { userId, title, message, notificationType, link } = req.body;

    // Kiểm tra nếu thiếu trường dữ liệu bắt buộc
    if (!userId || !title || !message || !notificationType) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    const validNotificationTypes = ['Order', 'Promotion', 'Message'];
    if (!validNotificationTypes.includes(notificationType)) {
        return res.status(400).json({
            success: false,
            message: `Invalid notification type. Must be one of: ${validNotificationTypes.join(', ')}`
        });
    }

    try {
        // Tạo thông báo mới
        const notification = await Notification.create({
            userId,
            title,
            message,
            notificationType,
            link: link || '',
            read: false
        });

        return res.status(201).json({
            success: true,
            newNotification: notification
        });
    } catch (error) {
        // Xử lý lỗi khi tạo thông báo
        return res.status(500).json({
            success: false,
            message: 'Error creating notification: ' + error.message
        });
    }
});

const getNotiByUserId = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    if (!uid) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required'
        });
    }

    try {
        // Tìm tất cả thông báo dựa trên `userId`
        const notifications = await Notification.find({ userId: uid }).sort({ createdAt: -1 }).exec();

        if (!notifications) {
            return res.status(404).json({
                success: false,
                message: 'No notifications found for this user'
            });
        }


        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching notifications: ' + error.message
        });
    }

});

const getAllNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.query.userId;

    try {
        const query = userId ? { userId } : {};
        const notifications = await Notification.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
        const count = await Notification.countDocuments(query);

        return res.status(200).json({
            success: true,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalNotifications: count,
            notificationList: notifications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mess: 'Error get notification list: ' + error.message
        });
    }
})

module.exports = {
    createNotification,
    getNotiByUserId,
    getAllNotifications
};