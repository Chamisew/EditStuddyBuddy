import Notification from '../models/notificationModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const createNotification = asyncHandler(async (userId, title, message, data = {}) => {
  const n = new Notification({ userId, title, message, data });
  return await n.save();
});

// API to fetch notifications for authenticated user
const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) {
    res.status(401);
    throw new Error('Not authenticated');
  }
  const list = await Notification.find({ userId }).sort({ createdAt: -1 });
  res.json(list);
});

// API to delete a notification owned by the authenticated user
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  const notifId = req.params.id;
  const notif = await Notification.findById(notifId);
  if (!notif) {
    res.status(404);
    throw new Error('Notification not found');
  }
  if (notif.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }
  await Notification.deleteOne({ _id: notifId });
  res.json({ success: true });
});

// API to mark a notification as read
const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  const notifId = req.params.id;
  const notif = await Notification.findById(notifId);
  if (!notif) {
    res.status(404);
    throw new Error('Notification not found');
  }
  if (notif.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  notif.read = true;
  await notif.save();
  res.json(notif);
});

export { createNotification, getMyNotifications, deleteNotification, markNotificationRead };
