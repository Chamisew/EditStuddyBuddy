import express from "express";
import {
  createCollector,
  getAllCollectors,
  getCollectorsByWMA,
  updateCollector,
  deleteCollector,
  getCollectorById,
  loginCollector,
  getCurrentCollectorProfile,
  logoutCurrentCollector,
} from "../controllers/collectorController.js";
import { completeSchedule } from "../controllers/scheduleController.js";
import {
  authenticate,
  authorizeAdmin,
  authenticateWMA,
  authenticateCollector,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to create a new collector
router
  .route("/")
  .post(authenticateWMA, createCollector)
  .get(getAllCollectors);

router.post("/logout", authenticateCollector, logoutCurrentCollector);

router.post("/auth", loginCollector);
router.route("/wma-collectors/:id").get(getCollectorsByWMA);

router.route("/profile").get(authenticateCollector, getCurrentCollectorProfile);

// Collector marks a schedule as completed
router.post('/schedules/:id/complete', authenticateCollector, completeSchedule);

// Route to update and delete a truck
router
  .route("/:id")
  .get(getCollectorById)
  .put(updateCollector)
  .delete(deleteCollector);

export default router;
