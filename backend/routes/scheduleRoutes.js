import express from "express";
import {
  createSchedule,
  getAllSchedules,
  getTruckSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getSchedulesByWma,
  createScheduleWithNotification,
} from "../controllers/scheduleController.js";
import { authenticate, authorizeAdmin, authenticateCollector, authenticateWMA } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(authenticate, authorizeAdmin, createScheduleWithNotification)
  .get(authenticate, authorizeAdmin, getAllSchedules);
  // .post(authenticate, authorizeAdmin, createSchedule)
  // .get(authenticate, getAllSchedules);

router.route("/collector-schedules").get(authenticateCollector,getTruckSchedules);

// Fetch schedules for a specific WMA by id (admin or public), or for the authenticated WMA
router.route("/wma-schedules/:id").get(getSchedulesByWma);

// Authenticated WMA can fetch their own schedules
router.route("/wma-schedules/me").get(authenticateWMA, getSchedulesByWma);

router
  .route("/:id")
  .get(getScheduleById)
  .put(updateSchedule)
  .delete(deleteSchedule);
  // .get(authenticate, getScheduleById)
  // .put(authenticate, authorizeAdmin, updateSchedule)
  // .delete(authenticate, authorizeAdmin, deleteSchedule);

export default router;