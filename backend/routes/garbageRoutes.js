import express from "express";
import {
  createGarbageRequest,
  getAllGarbageRequests,
  getUserGarbageRequests,
  getGarbageRequestById,
  updateGarbageRequest,
  deleteGarbageRequest,
  getGarbageRequestByArea,
  scanGarbage,
  getGarbageQr,
} from "../controllers/garbageController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { authenticateCollector } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to create a new garbage request and get all garbage requests
router
  .route("/")
  .post(authenticate, createGarbageRequest)
  .get(getAllGarbageRequests);

// Route to get garbage requests for a specific user
router.route("/garbage-requests").get(authenticate, getUserGarbageRequests);
router.route("/garbage-requests-area/:id").get(getGarbageRequestByArea);

// Routes to get, update, and delete a garbage request by ID
router
  .route("/:id")
  .get(getGarbageRequestById)
  .put(updateGarbageRequest)
  .delete(authenticate, deleteGarbageRequest);

// Collector scan endpoint: POST /api/garbage/:garbageId/scan
router.post('/:garbageId/scan', authenticateCollector, scanGarbage);

// DEV-ONLY: Allow scanning without authentication for local testing.
// Remove or protect this endpoint in production.
router.post('/:garbageId/scan/noauth', scanGarbage);

// DEV-ONLY convenience: allow GET with token in querystring so a scanned QR can
// open a URL like `/api/garbage/:id/scan/noauth?token=...` in a browser. For
// security this should NOT exist in production.
router.get('/:garbageId/scan/noauth', (req, res, next) => {
  // copy token from query into body so the same handler can be reused
  req.body = req.body || {};
  req.body.token = req.query.token;
  // call the same handler (it's wrapped by asyncHandler)
  return scanGarbage(req, res, next);
});

// Return QR for garbage (data URL) so UI can display or print it. Dev only.
router.get('/:garbageId/qr', getGarbageQr);

export default router;
