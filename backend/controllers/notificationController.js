const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    // Get notifications targeted to this user OR to their role
    const notifications = await Notification.find({
      $or: [
        { forUser: req.user._id },
        { forRole: req.user.role },
      ]
    })
    .populate('fromUser', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(50);

    // Mark role-based read status using readBy array
    const enriched = notifications.map(n => {
      const obj = n.toObject();
      if (n.forUser) {
        obj.isRead = n.isRead;
      } else {
        obj.isRead = n.readBy.some(id => id.toString() === req.user._id.toString());
      }
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    // Count user-specific unread
    const userUnread = await Notification.countDocuments({
      forUser: req.user._id,
      isRead: false,
    });

    // Count role-based unread (not in readBy)
    const roleUnread = await Notification.countDocuments({
      forRole: req.user.role,
      readBy: { $nin: [req.user._id] },
    });

    res.json({ count: userUnread + roleUnread });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404);
      return next(new Error('Notification not found'));
    }

    if (notification.forUser) {
      notification.isRead = true;
    } else {
      // Role-based: add to readBy
      if (!notification.readBy.includes(req.user._id)) {
        notification.readBy.push(req.user._id);
      }
    }

    await notification.save();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res, next) => {
  try {
    // Mark user-specific
    await Notification.updateMany(
      { forUser: req.user._id, isRead: false },
      { isRead: true }
    );

    // Mark role-based
    await Notification.updateMany(
      { forRole: req.user.role, readBy: { $nin: [req.user._id] } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllRead };
