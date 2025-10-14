import Schedule from "../models/scheduleModel.js";
import Bin from "../models/binModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import Garbage from "../models/garbageModel.js";
import Transaction from "../models/transactionModel.js";
import SmartDevice from "../models/smartDeviceModel.js";
import { createNotification } from "./notificationController.js";

/**
 * @route   POST /api/schedule
 * @desc    Create a new schedule request
 * @access  Private
 * @param   {Object} wmaId - The id of the wast management authority (required)
 * @param   {Object} collectorId - The id of the collector (required)
 * @param   {String} area - The area of the collection (required)
 * @param   {String} time - the time of schedule (required)
 * @param   {String} date - the date of schedule (required)
 * @returns {Object} - A JSON object containing the newly created schedule data
 */
const createSchedule = asyncHandler(async (req, res) => {
  const { wmaId, collectorId, area, date, time } = req.body;

  // collectorId is optional (admin may create a schedule without assigning a collector)
  if (!wmaId || !area || !date || !time) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  const schedule = new Schedule({
    wmaId,
    collectorId: collectorId || null,
    area,
    date,
    time,
    longitude: null,
    latitude: null,
    status: 'Pending'
  });

  const createdSchedule = await schedule.save();

  // If this schedule was created for a specific bin, link the bin to the schedule and clear forwarded flag
  if (req.body.binId) {
    try {
      const bin = await Bin.findById(req.body.binId);
      if (bin) {
        bin.scheduleId = createdSchedule._id;
        bin.forwardedToAdmin = false; // mark as handled by admin
        await bin.save();
      }
    } catch (err) {
      console.warn('Failed to link schedule to bin:', err.message);
    }
  }

  res.status(201).json(createdSchedule);
});

// Enhanced: when schedule is created and linked to a garbage request (garbageId), create a notification for the user
const createScheduleWithNotification = asyncHandler(async (req, res) => {
  // Reuse existing logic above by constructing a request-like body
  const { wmaId, collectorId, area, date, time, garbageId } = req.body;

  // Create schedule
  const schedule = new Schedule({ wmaId, collectorId: collectorId || null, area, date, time, longitude: null, latitude: null, status: 'Pending', garbageId: garbageId || null });
  const createdSchedule = await schedule.save();

  // Link garbage if provided
  if (garbageId) {
    try {
      const garbage = await Garbage.findById(garbageId).populate('user');
      if (garbage && garbage.user) {
        // Prevent scheduling again if already scheduled
        if (garbage.status === 'Scheduled') {
          // cleanup: delete created schedule to avoid orphan schedule
          await Schedule.findByIdAndDelete(createdSchedule._id);
          res.status(400);
          throw new Error('Garbage request is already scheduled');
        }

        // mark garbage as scheduled
        garbage.status = 'Scheduled';
        await garbage.save();

        // Build message: include collector name, date, time, truck id if collector assigned
        let collectorInfo = '';
        if (collectorId) {
          const collector = await (await import('../models/collectorModel.js')).default.findById(collectorId);
          if (collector) collectorInfo = `Collector: ${collector.collectorName} (Truck: ${collector.truckNumber})`;
        }

        const message = `Your waste pickup is scheduled on ${date} at ${time}. ${collectorInfo}`;
        await createNotification(garbage.user._id, 'Waste Pickup Scheduled', message, { scheduleId: createdSchedule._id, garbageId });
      }
    } catch (err) {
      console.warn('Failed to create notification for schedule:', err.message);
    }
  }

  res.status(201).json(createdSchedule);
});

export { createScheduleWithNotification };

// Collector completes a schedule: update schedule.status -> 'Completed',
// optionally mark linked garbage as 'Collected', mark smart device as 'Distributed',
// and create a Transaction for the user (isPaid=false).
const completeSchedule = asyncHandler(async (req, res) => {
  const scheduleId = req.params.id;
  const { garbageId, smartDeviceId } = req.body;

  // Atomically mark the schedule as Completed only if it's not already Completed.
  // Also enforce collector ownership if collectorId is set on the schedule.
  const filter = { _id: scheduleId };
  if (req.collector) {
    // Allow completion if schedule.collectorId is null OR equals req.collector._id.
    // We can't express that directly in findOneAndUpdate filter without $or on the DB side,
    // so we'll fetch the schedule first to validate collector permission, then atomically update.
    const scheduleCheck = await Schedule.findById(scheduleId);
    if (!scheduleCheck) {
      const err = new Error('Schedule not found');
      err.statusCode = 404;
      throw err;
    }
    if (scheduleCheck.collectorId && String(scheduleCheck.collectorId) !== String(req.collector._id)) {
      const err = new Error('Not authorized to complete this schedule');
      err.statusCode = 403;
      throw err;
    }
  }

  const schedule = await Schedule.findOneAndUpdate(
    { _id: scheduleId, status: { $ne: 'Completed' } },
    { $set: { status: 'Completed' } },
    { new: true }
  );

  if (!schedule) {
    const err = new Error('Schedule not found or already completed');
    err.statusCode = 409;
    throw err;
  }

  let updatedGarbage = null;
  let updatedDevice = null;
  let createdTransaction = null;

  // Determine garbageId: prefer explicit body param, otherwise use schedule's linked garbageId
  const effectiveGarbageId = garbageId || (schedule && schedule.garbageId ? String(schedule.garbageId) : null);

  // If a garbage request is part of this schedule, update it
  if (effectiveGarbageId) {
    const garbage = await Garbage.findById(effectiveGarbageId).populate('area user');
    if (garbage) {
      if (garbage.status === 'Collected') {
        // already collected; ignore
        updatedGarbage = garbage;
      } else {
        garbage.status = 'Collected';
        garbage.collectedBy = req.collector ? req.collector._id : null;
        garbage.collectedAt = Date.now();

        // compute amount
        let amount = 0;
        if (garbage.area && garbage.area.type === 'weightBased') {
          amount = (garbage.weight || 0) * (garbage.area.rate || 0);
        } else if (garbage.area) {
          amount = garbage.area.rate || 0;
        }

        // Only create a transaction if one does not already exist
        if (!garbage.transaction) {
          const transaction = new Transaction({
            user: garbage.user,
            description: `Garbage collection - request ${garbage._id}`,
            amount,
            isPaid: false,
            isRefund: false,
          });

          const savedTx = await transaction.save();
          garbage.transaction = savedTx._id;
          createdTransaction = savedTx;
          console.debug(`completeSchedule: created transaction ${savedTx._id} for user ${garbage.user}`);
        }

        await garbage.save();
        updatedGarbage = garbage;
      }
    }
  }

  // If a smart device is involved (e.g., distribution), update its status
  if (smartDeviceId) {
    const device = await SmartDevice.findById(smartDeviceId);
    if (device) {
      device.status = 'Distributed';
      device.garbageStatus = 'Collected';
      await device.save();
      updatedDevice = device;
    }
  }

  res.json({ schedule, garbage: updatedGarbage, smartDevice: updatedDevice, transaction: createdTransaction });
});

// Create a schedule for a specific urgent bin. This helper can be called
// when a bin becomes urgent to automatically enqueue a pickup schedule.
const createScheduleForBin = asyncHandler(async ({ wmaId, areaId, binId }) => {
  // For now create a schedule with status 'Urgent' and no collector assigned.
  const schedule = new Schedule({
    wmaId,
    collectorId: null,
    area: areaId,
    date: new Date(),
    time: new Date().toTimeString().slice(0,5),
    longitude: null,
    latitude: null,
    status: 'Urgent',
    binId,
  });

  const created = await schedule.save();
  return created;
});

/**
 * @route   GET /api/schedule
 * @desc    Get all schedule requests (Admin only)
 * @access  Private/Admin
 * @returns {Array} - A list of all schedules
 */
const getAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({})
  .populate("wmaId", "wmaname")
  .populate("collectorId", "collectorName")
  .populate("area", "name");
  res.json(schedules);
});

/**
 * @route   GET /api/schedules/my-schedules
 * @desc    Get all schedules assingd to the truck
 * @access  Private (Authenticated Truck)
 * @returns {Array} - A list of schedules assingd to the truck
 */
const getTruckSchedules = asyncHandler(async (req, res) => {
  const schedule = await Schedule.find({ collectorId: req.collector._id }).populate("area", "name")

  res.json(schedule);
});

/**
 * @route   GET /api/schedules/wma-schedules
 * @desc    Get all schedules assingd to the wma
 * @access  Private (Authenticated WMA)
 * @returns {Array} - A list of schedules assingd to the truck
 */
const getSchedulesByWma = asyncHandler(async (req, res) => {
  // Support both: fetching by param id (/wma-schedules/:id) or by authenticated WMA (req.wma)
  const wmaId = req.params.id || (req.wma && req.wma._id);
  if (!wmaId) {
    res.status(400);
    throw new Error('WMA id is required');
  }

  // Allow optional filtering by status (e.g., ?status=Urgent)
  const statusFilter = req.query.status;
  const query = { wmaId };
  if (statusFilter) query.status = statusFilter;

  const schedule = await Schedule.find(query)
    .populate("wmaId", "wmaname")
    .populate("collectorId", "collectorName")
    .populate("area", "name")
    .populate("binId", "name currentLevel capacity address");

  res.json(schedule);
});

/**
 * @route   GET /api/schedule/:id
 * @desc    Get a single schedule by ID
 * @access  Private
 * @returns {Object} - A single schedule
 */
const getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
  if (schedule) {
    res.json(schedule);
  } else {
    res.status(404);
    throw new Error("Schedule request not found");
  }
});

/**
 * @route   PUT /api/schedule/:id
 * @desc    Update a schedule status (Admin only)
 * @access  Private/Admin
 * @param   {Object} truckId - The id of the truck (required)
 * @param   {String} area - The area of the collection (required)
 * @param   {String} time - the time of schedule (required)
 * @param   {String} date - the date of schedule (required)
 * @returns {Object} - The updated garbage request
 */
const updateSchedule = asyncHandler(async (req, res) => {
  const { wmaId, collectorId, area, date, time, longitude, latitude, status} = req.body;

  const schedule = await Schedule.findById(req.params.id);

  if (schedule) {
    schedule.wmaId = wmaId || schedule.wmaId;
    schedule.collectorId = collectorId || schedule.collectorId;
    schedule.area = area || schedule.area;
    schedule.date = date || schedule.date;
    schedule.time = time || schedule.time;
    schedule.longitude = longitude || schedule.longitude;
    schedule.latitude = latitude || schedule.latitude;
    schedule.status = status || schedule.status;

    const updatedSchedule = await schedule.save();
    res.json(updatedSchedule);
  } else {
    res.status(404);
    throw new Error("Schedule request not found");
  }
});

/**
 * @route   DELETE /api/schedule/:id
 * @desc    Delete a schedule (Admin only)
 * @access  Private/Admin
 * @returns {Object} - A JSON object confirming deletion
 */
const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);

  if (schedule) {
    res.json({ message: "Schedule removed successfully!" });
  } else {
    res.status(404);
    throw new Error("Schedule not found!");
  }
});

export {
  createSchedule,
  getAllSchedules,
  getTruckSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getSchedulesByWma,
  createScheduleForBin,
  completeSchedule,
};
