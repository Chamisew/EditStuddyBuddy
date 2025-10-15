import express from 'express';
const router = express.Router();
import { getMyNotifications, deleteNotification, markNotificationRead } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

router.get('/me', authenticate, getMyNotifications);
router.delete('/:id', authenticate, deleteNotification);
router.patch('/:id/read', authenticate, markNotificationRead);

export default router;
