import express from 'express';
import { createBin, updateBinLevel, getBinsForUser, getUrgentBinsForWma, getAllBinsForWma, collectBin, forwardBinToAdmin, getBinsForwardedToAdmin, deleteBin } from '../controllers/binController.js';
import { authenticate, authenticateWMA, authenticateCollector, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create a bin (user)
router.post('/', authenticate, createBin);

// Update bin level (authenticated; could be device or user in practice)
router.put('/:binId/level', authenticate, updateBinLevel);

// Collector collects a bin
router.post('/:binId/collect', authenticateCollector, collectBin);

// WMA forwards an urgent bin to admin for further action
router.post('/:binId/forward', authenticateWMA, forwardBinToAdmin);

// Delete a bin (owner or admin)
router.delete('/:binId', authenticate, deleteBin);

// Get bins for current user
router.get('/mine', authenticate, getBinsForUser);

// Get urgent bins for WMA dashboard
router.get('/urgent', authenticateWMA, getUrgentBinsForWma);

// Get all bins for WMA
router.get('/wma', authenticateWMA, getAllBinsForWma);

// Admin: get bins forwarded by WMAs
router.get('/admin', authenticate, authorizeAdmin, getBinsForwardedToAdmin);

export default router;
